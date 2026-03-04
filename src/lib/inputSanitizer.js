/**
 * Input Sanitizer — Protects against XSS, injection, and data corruption
 * Use before ANY Firestore write or DOM insertion of user-provided data.
 */

// Strip all HTML tags
function stripTags(str) {
    if (typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '')
}

// Dangerous patterns that indicate XSS or injection
const DANGEROUS_PATTERNS = [
    /javascript\s*:/i,
    /on\w+\s*=/i,           // onclick=, onerror=, etc.
    /data\s*:\s*text\/html/i,
    /<\s*script/i,
    /<\s*iframe/i,
    /<\s*embed/i,
    /<\s*object/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /url\s*\(/i,
]

function containsDangerousContent(str) {
    if (typeof str !== 'string') return false
    return DANGEROUS_PATTERNS.some(p => p.test(str))
}

/**
 * Sanitize a string value for safe storage/display
 * @param {string} input — raw user input
 * @param {number} maxLen — max allowed length (default 200)
 * @returns {string} — sanitized string
 */
export function sanitizeString(input, maxLen = 200) {
    if (typeof input !== 'string') return ''
    let clean = stripTags(input).trim()
    if (containsDangerousContent(clean)) {
        // Remove all dangerous content instead of rejecting entirely
        clean = clean
            .replace(/javascript\s*:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/eval\s*\(/gi, '')
            .trim()
    }
    return clean.slice(0, maxLen)
}

/**
 * Sanitize a save name
 */
export function sanitizeSaveName(name) {
    return sanitizeString(name, 50) || 'Unnamed Save'
}

/**
 * Sanitize a username
 */
export function sanitizeUsername(name) {
    return sanitizeString(name, 20)
}

/**
 * Validate a Firebase UID format (alphanumeric, 28 chars typically)
 */
export function isValidUID(uid) {
    return typeof uid === 'string' && /^[a-zA-Z0-9]{20,40}$/.test(uid)
}

/**
 * Deep-sanitize an object — recursively sanitize all string values
 * and strip any keys that start with '__' (prototype pollution guard)
 */
export function sanitizeObject(obj, maxDepth = 5) {
    if (maxDepth <= 0 || obj === null || obj === undefined) return obj
    if (typeof obj === 'string') return sanitizeString(obj)
    if (typeof obj === 'number' || typeof obj === 'boolean') return obj
    if (Array.isArray(obj)) {
        return obj.slice(0, 100).map(item => sanitizeObject(item, maxDepth - 1))
    }
    if (typeof obj === 'object') {
        const clean = {}
        for (const [key, val] of Object.entries(obj)) {
            // Guard against prototype pollution
            if (key.startsWith('__') || key === 'constructor' || key === 'prototype') continue
            clean[sanitizeString(key, 50)] = sanitizeObject(val, maxDepth - 1)
        }
        return clean
    }
    return undefined  // reject anything else (functions, symbols, etc.)
}

/**
 * Validate data size before Firestore write (Firestore limit: 1MB per doc)
 */
export function isWithinSizeLimit(data, limitKB = 900) {
    try {
        const size = new Blob([JSON.stringify(data)]).size
        return size <= limitKB * 1024
    } catch {
        return false
    }
}

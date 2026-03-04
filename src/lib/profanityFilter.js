// Profanity filter for usernames
// Contains common slurs, offensive terms, and inappropriate words

const BLOCKED_WORDS = [
    // Racial slurs and variations
    'nigger', 'nigga', 'nigg', 'n1gger', 'n1gga', 'negro', 'negr0',
    'chink', 'ch1nk', 'gook', 'g00k', 'spic', 'sp1c', 'wetback',
    'beaner', 'kike', 'k1ke', 'towelhead', 'raghead', 'paki', 'pak1',
    'coon', 'c00n', 'darkie', 'jap', 'redskin', 'honky', 'cracker',
    'whitey', 'gringo', 'zipperhead',
    // Homophobic slurs
    'fag', 'faggot', 'fagg0t', 'f4ggot', 'dyke', 'tranny', 'shemale',
    // Profanity 
    'fuck', 'fck', 'fuk', 'f*ck', 'fucker', 'shit', 'sh1t', 'shite',
    'bitch', 'b1tch', 'bastard', 'asshole', 'a$$hole', 'assh0le',
    'cunt', 'c*nt', 'dick', 'd1ck', 'cock', 'penis', 'vagina',
    'pussy', 'puss', 'whore', 'slut', 'hoe',
    // Other offensive
    'retard', 'retarded', 'tard', 'nazi', 'naz1', 'hitler', 'h1tler',
    'kkk', 'terrorist', 'jihad', 'isis',
    'rape', 'rapist', 'molest', 'pedo', 'pedophile',
    'kill', 'murder', 'suicide', 'die',
    // Leetspeak / common bypass attempts
    'a55', 'pr1ck', 'w4nk', 'wank', 'cum', 'jizz',
]

/**
 * Check if a username contains profanity.
 * Returns { isClean: boolean, reason?: string }
 */
export function checkUsername(username) {
    if (!username || typeof username !== 'string') {
        return { isClean: false, reason: 'Username is required' }
    }

    const trimmed = username.trim()

    if (trimmed.length < 2) {
        return { isClean: false, reason: 'Username must be at least 2 characters' }
    }
    if (trimmed.length > 20) {
        return { isClean: false, reason: 'Username must be 20 characters or less' }
    }
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
        return { isClean: false, reason: 'Only letters, numbers, spaces, underscores, and hyphens allowed' }
    }

    // Check against blocked words (case-insensitive, partial match)
    const lower = trimmed.toLowerCase().replace(/[\s_\-]/g, '')

    for (const word of BLOCKED_WORDS) {
        if (lower.includes(word)) {
            return { isClean: false, reason: 'Username contains inappropriate language' }
        }
    }

    // Check for repeating characters (spam like "aaaaaaa")
    if (/(.)\1{4,}/.test(lower)) {
        return { isClean: false, reason: 'Too many repeating characters' }
    }

    return { isClean: true }
}

export default checkUsername

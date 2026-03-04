// Cloud Saves API — Sync user data between localStorage and Firestore
// All writes are sanitized. All operations require authentication.
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { sanitizeObject, sanitizeString, isValidUID, isWithinSizeLimit } from './inputSanitizer'

/**
 * Validate UID before any Firestore operation
 */
function requireAuth(uid) {
    if (!uid || !isValidUID(uid)) {
        throw new Error('Invalid or missing authentication')
    }
}

/**
 * Save user's game data to Firestore (sanitized)
 */
export async function syncToCloud(uid) {
    requireAuth(uid)

    const rawData = {
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
        playHistory: JSON.parse(localStorage.getItem('playHistory') || '[]'),
        lastPlayed: JSON.parse(localStorage.getItem('lastPlayed') || 'null'),
        settings: {
            crt: localStorage.getItem('crt') === 'true',
            scanlines: localStorage.getItem('scanlines') === 'true',
            audio: localStorage.getItem('audio') !== 'false'
        },
        lastSynced: serverTimestamp(),
        version: '1.0'
    }

    // Sanitize before writing
    const saveData = sanitizeObject(rawData)
    saveData.lastSynced = serverTimestamp() // re-add after sanitization

    if (!isWithinSizeLimit(saveData)) {
        throw new Error('Save data exceeds size limit')
    }

    const userSavesRef = doc(db, 'users', uid, 'data', 'saves')
    await setDoc(userSavesRef, saveData, { merge: true })
    return saveData
}

/**
 * Load user's game data from Firestore into localStorage
 */
export async function loadFromCloud(uid) {
    requireAuth(uid)

    const userSavesRef = doc(db, 'users', uid, 'data', 'saves')
    const snap = await getDoc(userSavesRef)

    if (!snap.exists()) {
        // No cloud data yet — first sync, push local to cloud
        await syncToCloud(uid)
        return null
    }

    const data = snap.data()

    // Write to localStorage
    if (data.favorites) localStorage.setItem('favorites', JSON.stringify(data.favorites))
    if (data.playHistory) localStorage.setItem('playHistory', JSON.stringify(data.playHistory))
    if (data.lastPlayed) localStorage.setItem('lastPlayed', JSON.stringify(data.lastPlayed))
    if (data.settings) {
        localStorage.setItem('crt', data.settings.crt)
        localStorage.setItem('scanlines', data.settings.scanlines)
        localStorage.setItem('audio', data.settings.audio)
    }

    return data
}

/**
 * Save game save-slot metadata to Firestore (sanitized).
 * Actual emulator state stays in localStorage (too large for Firestore).
 */
export async function saveGameState(uid, gameId, saveData) {
    requireAuth(uid)

    // Strip stateData and sanitize before sending
    const cloudSafe = {
        slots: (saveData.slots || []).map(slot => ({
            id: slot.id,
            name: sanitizeString(slot.name || `Save ${slot.slot}`, 50),
            date: sanitizeString(slot.date || '', 30),
            playtime: sanitizeString(slot.playtime || '', 20),
            slot: typeof slot.slot === 'number' ? slot.slot : 0
            // stateData intentionally excluded — kept in localStorage only
        })),
        timestamp: serverTimestamp(),
        gameId: sanitizeString(gameId, 50)
    }

    if (!isWithinSizeLimit(cloudSafe)) {
        throw new Error('Save data exceeds size limit')
    }

    const gameStateRef = doc(db, 'users', uid, 'gameStates', gameId)
    await setDoc(gameStateRef, cloudSafe)
}

/**
 * Load game save-slot metadata from Firestore.
 */
export async function loadGameState(uid, gameId) {
    requireAuth(uid)

    const gameStateRef = doc(db, 'users', uid, 'gameStates', gameId)
    const snap = await getDoc(gameStateRef)

    if (!snap.exists()) return null
    return snap.data()
}

/**
 * Update user profile in Firestore (sanitized)
 */
export async function updateUserProfile(uid, updates) {
    requireAuth(uid)

    const clean = sanitizeObject(updates)
    clean.updatedAt = serverTimestamp()

    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, clean)
}

/**
 * Sync XP/Achievement data to Firestore
 */
export async function syncXPData(uid) {
    requireAuth(uid)

    const raw = localStorage.getItem('xpData')
    if (!raw) return null

    let xpData
    try {
        xpData = JSON.parse(raw)
    } catch {
        return null
    }

    // Sanitize and strip functions (achievement check/progress)
    const cloudXP = {
        totalXP: typeof xpData.totalXP === 'number' ? xpData.totalXP : 0,
        gamesPlayed: typeof xpData.gamesPlayed === 'number' ? xpData.gamesPlayed : 0,
        totalFavorites: typeof xpData.totalFavorites === 'number' ? xpData.totalFavorites : 0,
        totalPlaytimeMin: typeof xpData.totalPlaytimeMin === 'number' ? xpData.totalPlaytimeMin : 0,
        sessionGames: typeof xpData.sessionGames === 'number' ? xpData.sessionGames : 0,
        consolesPlayed: typeof xpData.consolesPlayed === 'number' ? xpData.consolesPlayed : 0,
        bestStreak: typeof xpData.bestStreak === 'number' ? xpData.bestStreak : 0,
        currentStreak: typeof xpData.currentStreak === 'number' ? xpData.currentStreak : 0,
        lastPlayDate: sanitizeString(xpData.lastPlayDate || '', 20),
        playedGameIds: Array.isArray(xpData.playedGameIds) ? xpData.playedGameIds.slice(0, 200).map(id => sanitizeString(String(id), 50)) : [],
        playedConsoles: Array.isArray(xpData.playedConsoles) ? xpData.playedConsoles.slice(0, 20).map(c => sanitizeString(String(c), 30)) : [],
        unlockedAchievements: sanitizeObject(xpData.unlockedAchievements || {}),
        xpLog: Array.isArray(xpData.xpLog) ? xpData.xpLog.slice(0, 50).map(e => ({
            reason: sanitizeString(e.reason || '', 100),
            amount: typeof e.amount === 'number' ? e.amount : 0,
            timestamp: typeof e.timestamp === 'number' ? e.timestamp : 0
        })) : [],
        syncedAt: serverTimestamp()
    }

    if (!isWithinSizeLimit(cloudXP)) {
        throw new Error('XP data exceeds size limit')
    }

    const xpRef = doc(db, 'users', uid, 'data', 'xp')
    await setDoc(xpRef, cloudXP, { merge: true })
    return cloudXP
}

/**
 * Load XP/Achievement data from Firestore
 */
export async function loadXPData(uid) {
    requireAuth(uid)

    const xpRef = doc(db, 'users', uid, 'data', 'xp')
    const snap = await getDoc(xpRef)

    if (!snap.exists()) {
        // No cloud XP yet — push local
        await syncXPData(uid)
        return null
    }

    const data = snap.data()

    // Merge with local: keep whichever has more XP
    const raw = localStorage.getItem('xpData')
    let local
    try { local = JSON.parse(raw) } catch { local = null }

    if (local && local.totalXP > (data.totalXP || 0)) {
        // Local is ahead — push to cloud
        await syncXPData(uid)
        return local
    }

    // Cloud is ahead or equal — use cloud data
    localStorage.setItem('xpData', JSON.stringify(data))
    return data
}

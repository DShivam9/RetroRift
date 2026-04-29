// Cloud Saves API — Sync user data between localStorage and Firestore
// All writes are sanitized. All operations require authentication.
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
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
            crt: localStorage.getItem('crt_mode') === 'true',
            scanlines: localStorage.getItem('scanlines') === 'true',
            audio: localStorage.getItem('audio_enabled') !== 'false',
            musicVolume: Number(localStorage.getItem('music_volume') || 0.5),
            reducedMotion: localStorage.getItem('reduced_motion') === 'true'
        },
        profile: JSON.parse(localStorage.getItem('profileCustomization') || '{}'),
        lastSynced: serverTimestamp(),
        version: '1.1'
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

    // --- RECONCILIATION LOGIC ---
    
    // 1. Merge Favorites (Union of both)
    const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]')
    const cloudFavs = data.favorites || []
    const mergedFavs = Array.from(new Set([...localFavs, ...cloudFavs]))
    localStorage.setItem('favorites', JSON.stringify(mergedFavs))

    // 2. Merge Play History (Union + Sort by date if possible, but for simplicity just union)
    const localHistory = JSON.parse(localStorage.getItem('playHistory') || '[]')
    const cloudHistory = data.playHistory || []
    // Filter out duplicates by ID
    const mergedHistory = [...localHistory]
    cloudHistory.forEach(ch => {
        if (!mergedHistory.find(lh => lh.id === ch.id)) {
            mergedHistory.push(ch)
        }
    })
    localStorage.setItem('playHistory', JSON.stringify(mergedHistory))

    // 3. Last Played (Keep most recent)
    const localLast = JSON.parse(localStorage.getItem('lastPlayed') || 'null')
    const cloudLast = data.lastPlayed || null
    if (cloudLast && (!localLast || new Date(cloudLast.date) > new Date(localLast.date))) {
        localStorage.setItem('lastPlayed', JSON.stringify(cloudLast))
    }

    // 4. Settings (User preference - usually cloud wins as it's 'latest' state)
    if (data.settings) {
        localStorage.setItem('crt_mode', data.settings.crt)
        localStorage.setItem('scanlines', data.settings.scanlines)
        localStorage.setItem('audio_enabled', data.settings.audio)
        localStorage.setItem('music_volume', data.settings.musicVolume)
        localStorage.setItem('reduced_motion', data.settings.reducedMotion)
    }

    // 5. Profile Customization
    if (data.profile) {
        localStorage.setItem('profileCustomization', JSON.stringify(data.profile))
    }

    return { ...data, favorites: mergedFavs, playHistory: mergedHistory }
}

/**
 * Upload binary save state to Firebase Storage
 */
export async function uploadSaveState(uid, gameId, slotId, stateData) {
    requireAuth(uid)
    const path = `users/${uid}/saves/${gameId}/${slotId}.bin`
    console.log('[CloudSave] uploadSaveState called:', { uid, gameId, slotId, path, dataType: typeof stateData, dataLength: stateData?.length || stateData?.byteLength || 'unknown' })
    const storageRef = ref(storage, path)
    
    let dataToUpload = stateData
    
    // If stateData is base64 string, convert to binary
    if (typeof stateData === 'string') {
        console.log('[CloudSave] Converting base64 string to binary, length:', stateData.length)
        const binaryString = atob(stateData)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        dataToUpload = bytes
    }
    
    // Ensure dataToUpload is a Uint8Array or Blob
    const blob = dataToUpload instanceof Blob ? dataToUpload : new Blob([dataToUpload])
    console.log('[CloudSave] Uploading blob, size:', blob.size, 'bytes')
    
    try {
        await uploadBytes(storageRef, blob)
        const downloadURL = await getDownloadURL(storageRef)
        console.log('[CloudSave] ✅ Upload successful! URL:', downloadURL.substring(0, 80) + '...')
        return downloadURL
    } catch (err) {
        console.error('[CloudSave] ❌ Upload FAILED:', err.code, err.message)
        throw err
    }
}

/**
 * Download binary save state from Firebase Storage
 */
export async function downloadSaveState(uid, gameId, slotId) {
    requireAuth(uid)
    const storageRef = ref(storage, `users/${uid}/saves/${gameId}/${slotId}.bin`)
    
    try {
        const url = await getDownloadURL(storageRef)
        const response = await fetch(url)
        if (!response.ok) throw new Error('Cloud save download failed')
        return await response.arrayBuffer()
    } catch (err) {
        console.error('Download failed:', err)
        throw err
    }
}

/**
 * Delete binary save state from Firebase Storage
 */
export async function deleteSaveState(uid, gameId, slotId) {
    requireAuth(uid)
    const storageRef = ref(storage, `users/${uid}/saves/${gameId}/${slotId}.bin`)
    try {
        await deleteObject(storageRef)
    } catch (err) {
        // If file doesn't exist, ignore
        if (err.code !== 'storage/object-not-found') {
            console.error('Storage delete failed:', err)
            throw err
        }
    }
}

/**
 * Save game save-slot metadata to Firestore (sanitized).
 * Actual emulator state is uploaded to Storage.
 */
export async function saveGameState(uid, gameId, saveData) {
    requireAuth(uid)
    console.log('[CloudSave] saveGameState called:', { uid, gameId, slotCount: saveData?.slots?.length })

    // Process slots and handle binary uploads for NEW slots
    const processedSlots = await Promise.all((saveData.slots || []).map(async (slot) => {
        let cloudUrl = slot.cloudUrl || null

        // If this slot has NEW stateData that isn't in the cloud yet, upload it
        if (slot.stateData && !cloudUrl) {
            console.log('[CloudSave] Slot', slot.id, 'has stateData but no cloudUrl — uploading binary...')
            try {
                cloudUrl = await uploadSaveState(uid, gameId, slot.id, slot.stateData)
                console.log('[CloudSave] ✅ Slot', slot.id, 'uploaded, cloudUrl:', cloudUrl ? 'yes' : 'no')
            } catch (err) {
                console.error(`[CloudSave] ❌ Failed to upload slot ${slot.id}:`, err.code, err.message)
            }
        } else {
            console.log('[CloudSave] Slot', slot.id, '— stateData:', !!slot.stateData, 'cloudUrl:', !!cloudUrl, '(skipping upload)')
        }

        return {
            id: slot.id,
            name: sanitizeString(slot.name || `Save ${slot.slot}`, 50),
            date: sanitizeString(slot.date || '', 30),
            playtime: sanitizeString(slot.playtime || '', 20),
            slot: typeof slot.slot === 'number' ? slot.slot : 0,
            cloudUrl: cloudUrl,
            stateData: null // CRITICAL: Never store binary in Firestore
        }
    }))

    const cloudSafe = {
        slots: processedSlots,
        timestamp: serverTimestamp(),
        gameId: sanitizeString(gameId, 50)
    }

    const docId = String(gameId)
    const gameStateRef = doc(db, 'users', uid, 'gameStates', docId)
    console.log('[CloudSave] Writing metadata to Firestore:', gameStateRef.path, '— slots:', processedSlots.length)
    try {
        await setDoc(gameStateRef, cloudSafe)
        console.log('[CloudSave] ✅ Firestore metadata saved successfully!')
    } catch (err) {
        console.error('[CloudSave] ❌ Firestore write FAILED:', err.code, err.message)
        throw err
    }
    return processedSlots
}

/**
 * Load game save-slot metadata from Firestore.
 */
export async function getGameSaveMetadata(uid, gameId) {
    requireAuth(uid)

    const docId = String(gameId)
    const gameStateRef = doc(db, 'users', uid, 'gameStates', docId)
    const snap = await getDoc(gameStateRef)

    if (!snap.exists()) return null
    return snap.data()
}

/**
 * Fetch ALL game save manifests for a user (Global Save Manager)
 */
export async function getAllGameSaves(uid) {
    requireAuth(uid)
    const statesRef = collection(db, 'users', uid, 'gameStates')
    const snap = await getDocs(statesRef)
    
    return snap.docs.map(doc => ({
        gameId: doc.id,
        ...doc.data()
    }))
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

/**
 * XP Engine — Real progression system for RetroPlay Hub
 * Tracks XP, levels, achievements, play time, and streaks.
 * All data persisted to localStorage under 'xpData' key.
 */

// ─── XP Award Values ───
const XP_VALUES = {
    PLAY_GAME: 20,           // Start playing a game
    PLAY_5_MIN: 10,          // Every 5 minutes of play time
    ADD_FAVORITE: 5,         // Favorite a game
    FIRST_GAME_BONUS: 50,    // First ever game played
    STREAK_DAY: 15,          // Each consecutive day played
    ACHIEVEMENT_UNLOCK: 25,  // Unlocking any achievement
}

// ─── Achievement Definitions ───
export const ACHIEVEMENTS = [
    {
        id: 'first_steps',
        title: 'First Steps',
        desc: 'Play your first game',
        icon: '🎮',
        color: '#22d3ee',
        xpReward: 50,
        check: (d) => d.gamesPlayed >= 1,
        progress: (d) => Math.min(d.gamesPlayed / 1, 1),
    },
    {
        id: 'getting_started',
        title: 'Getting Started',
        desc: 'Play 5 different games',
        icon: '⭐',
        color: '#fbbf24',
        xpReward: 75,
        check: (d) => d.gamesPlayed >= 5,
        progress: (d) => Math.min(d.gamesPlayed / 5, 1),
    },
    {
        id: 'retro_explorer',
        title: 'Retro Explorer',
        desc: 'Play 10 different games',
        icon: '🏆',
        color: '#8b5cf6',
        xpReward: 100,
        check: (d) => d.gamesPlayed >= 10,
        progress: (d) => Math.min(d.gamesPlayed / 10, 1),
    },
    {
        id: 'collector',
        title: 'Collector',
        desc: 'Add 5 games to favorites',
        icon: '💜',
        color: '#ec4899',
        xpReward: 50,
        check: (d) => d.totalFavorites >= 5,
        progress: (d) => Math.min(d.totalFavorites / 5, 1),
    },
    {
        id: 'super_fan',
        title: 'Super Fan',
        desc: 'Add 10 games to favorites',
        icon: '🌟',
        color: '#f97316',
        xpReward: 100,
        check: (d) => d.totalFavorites >= 10,
        progress: (d) => Math.min(d.totalFavorites / 10, 1),
    },
    {
        id: 'dedicated',
        title: 'Dedicated Gamer',
        desc: 'Play for 30 minutes total',
        icon: '⏱️',
        color: '#10b981',
        xpReward: 75,
        check: (d) => d.totalPlaytimeMin >= 30,
        progress: (d) => Math.min(d.totalPlaytimeMin / 30, 1),
    },
    {
        id: 'marathon',
        title: 'Marathon Runner',
        desc: 'Play for 2 hours total',
        icon: '🔥',
        color: '#ef4444',
        xpReward: 150,
        check: (d) => d.totalPlaytimeMin >= 120,
        progress: (d) => Math.min(d.totalPlaytimeMin / 120, 1),
    },
    {
        id: 'speed_demon',
        title: 'Speed Demon',
        desc: 'Play 3 games in one session',
        icon: '⚡',
        color: '#f59e0b',
        xpReward: 50,
        check: (d) => d.sessionGames >= 3,
        progress: (d) => Math.min(d.sessionGames / 3, 1),
    },
    {
        id: 'console_hopper',
        title: 'Console Hopper',
        desc: 'Play games on 3 different consoles',
        icon: '🕹️',
        color: '#06b6d4',
        xpReward: 75,
        check: (d) => d.consolesPlayed >= 3,
        progress: (d) => Math.min(d.consolesPlayed / 3, 1),
    },
    {
        id: 'completionist',
        title: 'Completionist',
        desc: 'Play every console type (4+)',
        icon: '🎯',
        color: '#a855f7',
        xpReward: 200,
        check: (d) => d.consolesPlayed >= 4,
        progress: (d) => Math.min(d.consolesPlayed / 4, 1),
    },
    {
        id: 'streak_3',
        title: 'On Fire',
        desc: 'Play 3 days in a row',
        icon: '🔥',
        color: '#ef4444',
        xpReward: 100,
        check: (d) => d.bestStreak >= 3,
        progress: (d) => Math.min(d.bestStreak / 3, 1),
    },
    {
        id: 'level_5',
        title: 'Rising Star',
        desc: 'Reach Level 5',
        icon: '💎',
        color: '#3b82f6',
        xpReward: 100,
        check: (d) => d.currentLevel >= 5,
        progress: (d) => Math.min(d.currentLevel / 5, 1),
    },
]

// ─── Level Calculation ───
export function calcLevelFromXP(totalXP) {
    // Slower, satisfying progression: level = floor(sqrt(xp / 25)) + 1
    const level = Math.floor(Math.sqrt(totalXP / 25)) + 1
    // XP needed for this level: (level - 1)^2 * 25
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 25
    const xpForNextLevel = Math.pow(level, 2) * 25
    const xpInLevel = totalXP - xpForCurrentLevel
    const xpNeeded = xpForNextLevel - xpForCurrentLevel
    return {
        level,
        xpInLevel,
        xpNeeded,
        totalXP,
        progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 1,
    }
}

// ─── Title based on level ───
export function getPlayerTitle(level) {
    if (level >= 25) return { title: 'Legendary', emoji: '👑' }
    if (level >= 20) return { title: 'Master', emoji: '🏆' }
    if (level >= 15) return { title: 'Elite', emoji: '💎' }
    if (level >= 10) return { title: 'Veteran', emoji: '⚡' }
    if (level >= 7) return { title: 'Skilled', emoji: '🎮' }
    if (level >= 5) return { title: 'Active', emoji: '🔥' }
    if (level >= 3) return { title: 'Rising', emoji: '⭐' }
    return { title: 'Newcomer', emoji: '🕹️' }
}

// ─── Default XP Data ───
function getDefaultData() {
    return {
        totalXP: 0,
        gamesPlayed: 0,             // Unique game IDs played
        totalFavorites: 0,
        totalPlaytimeMin: 0,        // Real tracked minutes
        sessionGames: 0,            // Games played this session
        consolesPlayed: 0,
        bestStreak: 0,
        currentStreak: 0,
        lastPlayDate: null,         // ISO date string
        playedGameIds: [],          // Track unique games
        playedConsoles: [],         // Track unique consoles
        unlockedAchievements: {},   // { id: { unlockedAt: timestamp, xpAwarded: number } }
        xpLog: [],                  // Recent XP events: { reason, amount, timestamp }
    }
}

// ─── Load / Save ───
export function loadXPData() {
    try {
        const raw = localStorage.getItem('xpData')
        if (raw) {
            const parsed = JSON.parse(raw)
            return { ...getDefaultData(), ...parsed }
        }
    } catch (e) {
        console.warn('Failed to load XP data:', e)
    }
    return getDefaultData()
}

export function saveXPData(data) {
    try {
        localStorage.setItem('xpData', JSON.stringify(data))
    } catch (e) {
        console.warn('Failed to save XP data:', e)
    }
}

// ─── XP Actions ───

/** Award XP and log the event */
function awardXP(data, amount, reason) {
    data.totalXP += amount
    data.xpLog = [
        { reason, amount, timestamp: Date.now() },
        ...data.xpLog.slice(0, 49) // Keep last 50 events
    ]
    return data
}

/** Called when a game is started */
export function onGamePlayed(data, game) {
    let d = { ...data }

    // Track unique games
    if (!d.playedGameIds.includes(game.id)) {
        d.playedGameIds = [...d.playedGameIds, game.id]
        d.gamesPlayed = d.playedGameIds.length

        // First game ever bonus
        if (d.gamesPlayed === 1) {
            d = awardXP(d, XP_VALUES.FIRST_GAME_BONUS, '🎉 First game ever!')
        }
    }

    // Track unique consoles
    if (game.console && !d.playedConsoles.includes(game.console)) {
        d.playedConsoles = [...d.playedConsoles, game.console]
        d.consolesPlayed = d.playedConsoles.length
    }

    // Session games counter
    d.sessionGames = (d.sessionGames || 0) + 1

    // Streak tracking
    const today = new Date().toISOString().split('T')[0]
    if (d.lastPlayDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        if (d.lastPlayDate === yesterday) {
            d.currentStreak = (d.currentStreak || 0) + 1
            d = awardXP(d, XP_VALUES.STREAK_DAY, `🔥 ${d.currentStreak} day streak!`)
        } else {
            d.currentStreak = 1
        }
        d.bestStreak = Math.max(d.bestStreak || 0, d.currentStreak)
        d.lastPlayDate = today
    }

    // Base XP for playing
    d = awardXP(d, XP_VALUES.PLAY_GAME, `🎮 Played ${game.title}`)

    // Update level for achievement checks
    d.currentLevel = calcLevelFromXP(d.totalXP).level

    // Check achievements
    d = checkAchievements(d)

    saveXPData(d)
    return d
}

/** Called when play time is recorded (minutes) */
export function onPlayTimeRecorded(data, minutes) {
    let d = { ...data }
    d.totalPlaytimeMin = (d.totalPlaytimeMin || 0) + minutes

    // Award XP per 5 minutes
    const fiveMinBlocks = Math.floor(minutes / 5)
    if (fiveMinBlocks > 0) {
        d = awardXP(d, fiveMinBlocks * XP_VALUES.PLAY_5_MIN, `⏱️ Played for ${minutes} min`)
    }

    d.currentLevel = calcLevelFromXP(d.totalXP).level
    d = checkAchievements(d)

    saveXPData(d)
    return d
}

/** Called when a game is favorited */
export function onFavoriteAdded(data, totalFavorites) {
    let d = { ...data }
    d.totalFavorites = totalFavorites
    d = awardXP(d, XP_VALUES.ADD_FAVORITE, '💜 Added to favorites')

    d.currentLevel = calcLevelFromXP(d.totalXP).level
    d = checkAchievements(d)

    saveXPData(d)
    return d
}

/** Check and unlock achievements */
function checkAchievements(data) {
    let d = { ...data }

    for (const achievement of ACHIEVEMENTS) {
        // Skip already unlocked
        if (d.unlockedAchievements[achievement.id]) continue

        // Check if now meets requirement
        if (achievement.check(d)) {
            d.unlockedAchievements[achievement.id] = {
                unlockedAt: Date.now(),
                xpAwarded: achievement.xpReward,
            }
            d = awardXP(d, achievement.xpReward, `🏆 Achievement: ${achievement.title}`)
        }
    }

    return d
}

/** Get stats object for UI */
export function getStats(data) {
    const levelInfo = calcLevelFromXP(data.totalXP)
    const titleInfo = getPlayerTitle(levelInfo.level)
    const unlockedCount = Object.keys(data.unlockedAchievements || {}).length
    const totalAchievements = ACHIEVEMENTS.length

    return {
        ...levelInfo,
        ...titleInfo,
        gamesPlayed: data.gamesPlayed || 0,
        totalFavorites: data.totalFavorites || 0,
        totalPlaytimeMin: data.totalPlaytimeMin || 0,
        consolesPlayed: data.consolesPlayed || 0,
        currentStreak: data.currentStreak || 0,
        bestStreak: data.bestStreak || 0,
        sessionGames: data.sessionGames || 0,
        unlockedCount,
        totalAchievements,
        achievementProgress: totalAchievements > 0 ? unlockedCount / totalAchievements : 0,
        xpLog: data.xpLog || [],
        unlockedAchievements: data.unlockedAchievements || {},
    }
}

/** Format play time nicely */
export function formatPlaytime(minutes) {
    if (minutes < 1) return '< 1 min'
    if (minutes < 60) return `${Math.round(minutes)} min`
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Format relative time */
export function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
}

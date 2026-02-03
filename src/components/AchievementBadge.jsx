import React from 'react'
import { Trophy, Star, Gamepad2, Clock, Zap, Award, Target, Flame } from 'lucide-react'
import './AchievementBadge.css'

// Achievement definitions
export const ACHIEVEMENTS = [
    {
        id: 'first_game',
        title: 'First Steps',
        description: 'Play your first game',
        icon: Gamepad2,
        color: '#22d3ee',
        requirement: (stats) => stats.gamesPlayed >= 1
    },
    {
        id: 'five_games',
        title: 'Getting Started',
        description: 'Play 5 different games',
        icon: Star,
        color: '#fbbf24',
        requirement: (stats) => stats.gamesPlayed >= 5
    },
    {
        id: 'ten_games',
        title: 'Retro Explorer',
        description: 'Play 10 different games',
        icon: Trophy,
        color: '#8b5cf6',
        requirement: (stats) => stats.gamesPlayed >= 10
    },
    {
        id: 'hour_played',
        title: 'Dedicated Gamer',
        description: 'Play for 1 hour total',
        icon: Clock,
        color: '#10b981',
        requirement: (stats) => stats.totalPlaytime >= 60
    },
    {
        id: 'favorite_five',
        title: 'Collector',
        description: 'Add 5 games to favorites',
        icon: Award,
        color: '#ec4899',
        requirement: (stats) => stats.favorites >= 5
    },
    {
        id: 'speedrunner',
        title: 'Speed Demon',
        description: 'Quick start 3 games in one session',
        icon: Zap,
        color: '#f97316',
        requirement: (stats) => stats.sessionGames >= 3
    },
    {
        id: 'completionist',
        title: 'Completionist',
        description: 'Play every console type',
        icon: Target,
        color: '#06b6d4',
        requirement: (stats) => stats.consolesPlayed >= 4
    },
    {
        id: 'marathon',
        title: 'Marathon Runner',
        description: 'Play for 5 hours total',
        icon: Flame,
        color: '#ef4444',
        requirement: (stats) => stats.totalPlaytime >= 300
    }
]

// Single badge component
export function AchievementBadge({ achievement, unlocked = false, showDetails = true }) {
    const Icon = achievement.icon

    return (
        <div className={`achievement-badge ${unlocked ? 'achievement-badge--unlocked' : ''}`}>
            <div
                className="achievement-badge__icon"
                style={{
                    '--badge-color': unlocked ? achievement.color : '#374151',
                    '--badge-glow': unlocked ? `${achievement.color}40` : 'transparent'
                }}
            >
                <Icon size={24} />
            </div>
            {showDetails && (
                <div className="achievement-badge__info">
                    <span className="achievement-badge__title">{achievement.title}</span>
                    <span className="achievement-badge__desc">{achievement.description}</span>
                </div>
            )}
        </div>
    )
}

// Trophy cabinet component
export function TrophyCabinet({ stats }) {
    const unlockedCount = ACHIEVEMENTS.filter(a => a.requirement(stats)).length

    return (
        <div className="trophy-cabinet">
            <div className="trophy-cabinet__header">
                <h3 className="trophy-cabinet__title">
                    <Trophy size={20} />
                    Achievements
                </h3>
                <span className="trophy-cabinet__count">
                    {unlockedCount} / {ACHIEVEMENTS.length}
                </span>
            </div>
            <div className="trophy-cabinet__grid">
                {ACHIEVEMENTS.map(achievement => (
                    <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={achievement.requirement(stats)}
                    />
                ))}
            </div>
        </div>
    )
}

export default AchievementBadge

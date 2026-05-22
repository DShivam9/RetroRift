import React from 'react'

/**
 * GameBadge - Display badges like NEW, POPULAR, FEATURED on game cards
 */
export default function GameBadge({ type, className = '' }) {
    const badges = {
        new: { label: 'NEW', className: 'game-card__badge--new' },
        popular: { label: 'HOT', className: 'game-card__badge--popular' },
        featured: { label: 'FEATURED', className: 'game-card__badge--featured' }
    }

    const badge = badges[type]
    if (!badge) return null

    if (type === 'popular') {
        return (
            <div className={`game-badge-wrapper ${className}`}>
                <div className="fire-fx-base"></div>
                <div className="fire-particles">
                    <div className="fire-teardrop t-1"></div>
                    <div className="fire-teardrop t-2"></div>
                    <div className="fire-teardrop t-3"></div>
                    <div className="fire-teardrop t-4"></div>
                    <div className="fire-teardrop t-5"></div>
                    <div className="fire-teardrop t-6"></div>
                </div>
                <span className={`game-card__badge ${badge.className}`}>
                    {badge.label}
                </span>
            </div>
        )
    }

    return (
        <span className={`game-card__badge ${badge.className} ${className}`}>
            {badge.label}
        </span>
    )
}


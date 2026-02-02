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

    return (
        <span className={`game-card__badge ${badge.className} ${className}`}>
            {badge.label}
        </span>
    )
}

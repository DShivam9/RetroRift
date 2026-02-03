import React from 'react'
import './Skeleton.css'

// Base skeleton element
export function Skeleton({ width, height, borderRadius = '8px', className = '' }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius }}
        />
    )
}

// Card skeleton for game cards
export function CardSkeleton() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-card__image skeleton" />
            <div className="skeleton-card__body">
                <div className="skeleton skeleton--text skeleton--title" />
                <div className="skeleton skeleton--text skeleton--subtitle" />
            </div>
        </div>
    )
}

// Grid of card skeletons
export function CardGridSkeleton({ count = 8 }) {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

// Profile header skeleton
export function ProfileSkeleton() {
    return (
        <div className="skeleton-profile">
            <div className="skeleton skeleton--avatar" />
            <div className="skeleton-profile__info">
                <div className="skeleton skeleton--text skeleton--name" />
                <div className="skeleton skeleton--text skeleton--bio" />
            </div>
        </div>
    )
}

// List item skeleton
export function ListSkeleton({ count = 5 }) {
    return (
        <div className="skeleton-list">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-list__item">
                    <div className="skeleton skeleton--icon" />
                    <div className="skeleton skeleton--text skeleton--line" />
                </div>
            ))}
        </div>
    )
}

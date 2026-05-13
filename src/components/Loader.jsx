import React from 'react'
import '../styles/components.css'

/**
 * Loader - Clean loading spinner with optional text
 */
export function Loader({ text = 'Loading...', variant = 'full' }) {
    const isInline = variant === 'inline'
    return (
        <div className={`loader ${isInline ? 'loader--inline' : ''}`}>
            <div className="loader__spinner" />
            {text && !isInline && <p className="loader__text">{text}</p>}
            {text && isInline && <span className="loader__text">{text}</span>}
        </div>
    )
}

/**
 * Skeleton - Placeholder for loading content
 */
export function Skeleton({ variant = 'card', count = 1 }) {
    const skeletons = Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton skeleton--${variant}`} />
    ))

    return <>{skeletons}</>
}

/**
 * PageLoader - Full page loading state
 */
export function PageLoader({ text }) {
    return (
        <div className="page-loader">
            <Loader text={text} />
        </div>
    )
}

export default Loader

import React from 'react'
import './FloatingOrbs.css'

export default function FloatingOrbs({ theme = 'midnight' }) {
    return (
        <div className={`orbs-container orbs-theme-${theme}`}>
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="orb-glass-overlay" />
        </div>
    )
}

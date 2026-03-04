import React from 'react'
import './FooterGrid.css'

/**
 * FooterGrid — CSS-only animated glow effect for the footer
 * Inspired by FooterGlow: beam + orbs + streaks + fog
 */
export default function FooterGrid() {
    return (
        <div className="footer-grid">
            {/* Central beam line */}
            <div className="footer-grid__beam" />

            {/* Pulsing glow orbs */}
            <div className="footer-grid__orb footer-grid__orb--1" />
            <div className="footer-grid__orb footer-grid__orb--2" />
            <div className="footer-grid__orb footer-grid__orb--3" />

            {/* Sweeping light streaks */}
            <div className="footer-grid__streak footer-grid__streak--1" />
            <div className="footer-grid__streak footer-grid__streak--2" />
            <div className="footer-grid__streak footer-grid__streak--3" />

            {/* Fog overlay */}
            <div className="footer-grid__fog footer-grid__fog--1" />
            <div className="footer-grid__fog footer-grid__fog--2" />
        </div>
    )
}

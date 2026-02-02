import React from 'react'

/**
 * AnimatedBackground - Subtle animated background with floating orbs and grid
 */
export default function AnimatedBackground() {
    return (
        <div className="animated-bg" aria-hidden="true">
            {/* Animated grid */}
            <div className="animated-bg__grid" />

            {/* Floating orbs */}
            <div className="animated-bg__orb animated-bg__orb--1" />
            <div className="animated-bg__orb animated-bg__orb--2" />
            <div className="animated-bg__orb animated-bg__orb--3" />

            {/* Subtle scan line */}
            <div className="animated-bg__scanline" />
        </div>
    )
}

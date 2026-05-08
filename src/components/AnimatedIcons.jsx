import React from 'react'

/**
 * Animated UI Components
 * Optimized with React.memo to prevent unnecessary re-renders in heavy dashboards.
 */

// Default avatar — clean, static geometric user icon
export const AnimatedAvatar = React.memo(({ size = 80, color = '#8b5cf6' }) => {
    const s = typeof size === 'number' ? `${size}px` : size
    return (
        <div className="animated-avatar" style={{ width: s, height: s }}>
            <svg viewBox="0 0 100 100" className="animated-avatar__svg">
                {/* Subtle hex frame */}
                <polygon 
                    points="50,14 78,30 78,62 50,78 22,62 22,30" 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="1.5" 
                    strokeLinejoin="round"
                    opacity="0.35"
                />

                {/* User head */}
                <circle cx="50" cy="38" r="10" fill={`${color}20`} stroke={color} strokeWidth="1.5" opacity="0.8" />

                {/* User shoulders */}
                <path 
                    d="M 32 68 Q 32 54 41 50 Q 50 47 59 50 Q 68 54 68 68" 
                    fill={`${color}12`} 
                    stroke={color} 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    opacity="0.7"
                />
            </svg>
        </div>
    )
});

// Pixel heart animation
export const PixelHeart = React.memo(({ size = 24, color = '#ec4899', animated = true }) => {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={animated ? 'pixel-heart--animated' : ''}>
            <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={color}
            >
                {animated && <animate attributeName="fill-opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite" />}
            </path>
        </svg>
    )
});

// Gamepad animation
export const AnimatedGamepad = React.memo(({ size = 24, color = '#22d3ee' }) => {
    return (
        <svg viewBox="0 0 32 32" width={size} height={size}>
            <rect x="4" y="10" width="24" height="14" rx="7" fill="none" stroke={color} strokeWidth="2">
                <animate attributeName="y" values="10;9;10" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="9" y="14" width="2" height="6" rx="1" fill={color} />
            <rect x="7" y="16" width="6" height="2" rx="1" fill={color} />
            <circle cx="22" cy="15" r="1.5" fill={color}>
                <animate attributeName="fill-opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="18" r="1.5" fill={color}>
                <animate attributeName="fill-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
            </circle>
        </svg>
    )
});

// Trophy animation
export const AnimatedTrophy = React.memo(({ size = 24, color = '#fbbf24' }) => {
    return (
        <svg viewBox="0 0 32 32" width={size} height={size}>
            <path d="M10 6h12v10a6 6 0 01-12 0V6z" fill="none" stroke={color} strokeWidth="2">
                <animate attributeName="stroke-opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M10 8H6a2 2 0 00-2 2v2a4 4 0 004 4h2" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M22 8h4a2 2 0 012 2v2a4 4 0 01-4 4h-2" fill="none" stroke={color} strokeWidth="1.5" />
            <rect x="14" y="22" width="4" height="4" rx="1" fill={color} />
            <rect x="10" y="26" width="12" height="2" rx="1" fill={color} />
            <circle cx="16" cy="3" r="1" fill={color}>
                <animate attributeName="r" values="0;1.5;0" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="8" cy="5" r="1" fill={color}>
                <animate attributeName="r" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="24" cy="5" r="1" fill={color}>
                <animate attributeName="r" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
        </svg>
    )
});

// Sparkle effect
export const SparkleEffect = React.memo(({ size = 60, color = '#8b5cf6', active = true }) => {
    if (!active) return null
    return (
        <svg viewBox="0 0 60 60" width={size} height={size} className="sparkle-effect">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <line
                    key={i}
                    x1="30" y1="30"
                    x2={30 + 20 * Math.cos(angle * Math.PI / 180)}
                    y2={30 + 20 * Math.sin(angle * Math.PI / 180)}
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.7"
                >
                    <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
                    <animate
                        attributeName="x2"
                        values={`${30 + 15 * Math.cos(angle * Math.PI / 180)};${30 + 25 * Math.cos(angle * Math.PI / 180)};${30 + 15 * Math.cos(angle * Math.PI / 180)}`}
                        dur="1.5s"
                        repeatCount="indefinite"
                        begin={`${i * 0.15}s`}
                    />
                    <animate
                        attributeName="y2"
                        values={`${30 + 15 * Math.sin(angle * Math.PI / 180)};${30 + 25 * Math.sin(angle * Math.PI / 180)};${30 + 15 * Math.sin(angle * Math.PI / 180)}`}
                        dur="1.5s"
                        repeatCount="indefinite"
                        begin={`${i * 0.15}s`}
                    />
                </line>
            ))}
        </svg>
    )
});

// XP Progress bar
export const XPBar = React.memo(({ 
    currentXP = 0, 
    maxXP = 100, 
    level = 1, 
    accent = '#8b5cf6', 
    style = 'default', 
    hideLevel = false, 
    hideHeader = false 
}) => {
    const pct = Math.min((currentXP / maxXP) * 100, 100)
    
    return (
        <div className={`xp-bar-v4 xp-bar--${style}`} style={{ '--bar-accent': accent }}>
            <div className="xp-bar__inner">
                <div className="xp-bar__track">
                    <div className="xp-bar__fill" style={{ width: `${pct}%` }}>
                        <div className="xp-bar__energy" />
                        <div className="xp-bar__particles" />
                    </div>
                    {pct > 0 && pct < 100 && (
                        <div className="xp-bar__tip-glow" style={{ left: `${pct}%` }} />
                    )}
                    {style === 'glass-tube' && <div className="xp-bar__glass-reflection" />}
                    {style === 'segmented' && (
                        <div className="xp-bar__segment-overlay">
                            {[...Array(10)].map((_, i) => <div key={i} className="xp-bar__segment-mark" />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
});


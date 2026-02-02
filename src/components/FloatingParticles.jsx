import React, { useMemo } from 'react'
import './FloatingParticles.css'

/**
 * FloatingParticles - Subtle floating particles background for sections
 */
export default function FloatingParticles({ count = 15, color = 'purple' }) {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: 2 + Math.random() * 4,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 10,
            opacity: 0.2 + Math.random() * 0.3
        }))
    }, [count])

    return (
        <div className={`floating-particles floating-particles--${color}`}>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="floating-particles__dot"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        opacity: p.opacity
                    }}
                />
            ))}

            {/* Subtle grid overlay */}
            <div className="floating-particles__grid" />
        </div>
    )
}

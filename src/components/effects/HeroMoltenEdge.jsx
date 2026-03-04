import React, { memo } from 'react'
import { motion } from 'framer-motion'

/**
 * HeroMoltenEdge — dark top fading into volcanic lava at the bottom edge
 * Accent-tinted molten glow that breathes
 */
const HeroMoltenEdge = memo(({ accent = '#f97316' }) => {
    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#040100' }}>
            {/* Dark void top */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(20,5,0,0.8) 0%, transparent 60%)' }} />

            {/* Magma glow bottom */}
            <motion.div
                className="absolute inset-x-0 bottom-0"
                style={{ height: '50%', background: `linear-gradient(to top, ${accent}55 0%, ${accent}22 30%, transparent 100%)` }}
                animate={{ opacity: [0.7, 1, 0.8, 1, 0.7] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Second accent pool */}
            <motion.div
                className="absolute inset-x-0 bottom-0"
                style={{ height: '30%', background: `linear-gradient(to top, rgba(255,50,0,0.4) 0%, transparent 100%)` }}
                animate={{ opacity: [0.5, 0.9, 0.5], scaleX: [1, 1.02, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Rising ember specks */}
            {Array.from({ length: 20 }, (_, i) => (
                <motion.div key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 1 + Math.random() * 2, height: 1 + Math.random() * 2,
                        background: `hsl(${20 + Math.random() * 30}, 100%, 70%)`,
                        left: `${5 + Math.random() * 90}%`, bottom: '5%',
                        boxShadow: `0 0 4px rgba(255,150,50,0.8)`,
                    }}
                    animate={{ y: [0, -(60 + Math.random() * 100)], opacity: [0, 1, 0] }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * -3, ease: 'easeOut' }}
                />
            ))}

            {/* Crack lines at bottom */}
            <svg className="absolute bottom-0 inset-x-0 w-full" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
                <motion.path d="M0 60 L50 40 L90 55 L140 35 L200 50 L270 30 L320 48 L380 28 L400 60" fill="none"
                    stroke={accent} strokeWidth="1.5" strokeOpacity="0.5"
                    animate={{ strokeOpacity: [0.3, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.path d="M0 60 L80 45 L150 58 L230 38 L300 52 L400 35 L400 60" fill={`${accent}25`}
                    animate={{ opacity: [0.5, 1, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
            </svg>
        </div>
    )
})
HeroMoltenEdge.displayName = 'HeroMoltenEdge'
export default HeroMoltenEdge

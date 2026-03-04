import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * HeroNeonHorizon — Dark hero with a vivid neon line at the horizon.
 * Mouse X: shifts the horizon glow horizontally
 */
const HeroNeonHorizon = memo(({ accent = '#22d3ee' }) => {
    const rawX = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 25, damping: 22 })
    const glowX = useTransform(springX, [0, 1], ['20%', '80%'])
    const lineShift = useTransform(springX, [0, 1], ['-5%', '5%'])

    useEffect(() => {
        const onMove = (e) => rawX.set(e.clientX / window.innerWidth)
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX])

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, #020208 0%, #04040f 60%, #060612 100%)` }}>

            {/* Stars field */}
            {Array.from({ length: 40 }, (_, i) => (
                <div key={i} className="absolute rounded-full bg-white pointer-events-none"
                    style={{
                        left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`,
                        width: Math.random() > 0.8 ? 2 : 1, height: Math.random() > 0.8 ? 2 : 1,
                        opacity: 0.2 + Math.random() * 0.6
                    }} />
            ))}

            {/* Horizon glow pool — tracks mouse */}
            <motion.div className="absolute pointer-events-none"
                style={{
                    bottom: '18%', left: glowX, translateX: '-50%',
                    width: '45%', height: '25%',
                    background: `radial-gradient(ellipse, ${accent}30 0%, transparent 70%)`,
                    filter: 'blur(20px)', willChange: 'transform',
                }} />

            {/* Horizon line */}
            <motion.div className="absolute pointer-events-none inset-x-0" style={{ bottom: '18%', height: '2px' }}>
                <motion.div className="absolute inset-y-0" style={{
                    left: lineShift,
                    right: lineShift,
                    background: `linear-gradient(90deg, transparent 0%, ${accent}aa 20%, ${accent} 50%, ${accent}aa 80%, transparent 100%)`,
                    boxShadow: `0 0 20px 4px ${accent}80, 0 0 60px 10px ${accent}40`,
                    willChange: 'transform',
                }} />
            </motion.div>

            {/* Neon reflection below horizon */}
            <div className="absolute inset-x-0 pointer-events-none" style={{
                bottom: 0, top: '82%',
                background: `linear-gradient(to bottom, ${accent}15 0%, transparent 100%)`,
                filter: 'blur(4px)',
            }} />

            {/* Vertical city accent lines (distant buildings) */}
            {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="absolute pointer-events-none"
                    style={{
                        bottom: '18%', left: `${5 + i * 8}%`,
                        width: 1, height: `${8 + Math.random() * 20}%`,
                        background: `linear-gradient(to top, ${accent}60, transparent)`,
                        opacity: 0.3 + Math.random() * 0.4,
                    }} />
            ))}

            {/* Top fade */}
            <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: 'linear-gradient(to bottom, rgba(2,2,8,0.9) 0%, transparent 100%)' }} />
        </div>
    )
})
HeroNeonHorizon.displayName = 'HeroNeonHorizon'
export default HeroNeonHorizon

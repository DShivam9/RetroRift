import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Blood Ritual — gothic crimson atmosphere with cursor-driven light cone
 * Mouse: shifts the position of a god-ray style crimson light beam
 */
const BloodRitual = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 25, damping: 22 })
    const springY = useSpring(rawY, { stiffness: 25, damping: 22 })

    const lightLeft = useTransform(springX, [0, 1], ['20%', '80%'])
    const lightOpacity = useTransform(springY, [0, 1], [0.9, 0.4])
    const fogX = useTransform(springX, [0, 1], ['-5%', '5%'])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#020000' }}>

            {/* Deep red base atmosphere */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(60,0,0,0.9) 0%, rgba(20,0,0,0.7) 50%, transparent 100%)' }} />

            {/* Slow drifting fog layers */}
            <motion.div
                style={{ x: fogX }}
                className="absolute inset-0"
            >
                <motion.div
                    className="absolute inset-0"
                    animate={{ x: ['-4%', '4%', '-4%'], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: 'radial-gradient(ellipse at 40% 60%, rgba(80,5,5,0.5) 0%, transparent 55%)' }}
                />
                <motion.div
                    className="absolute inset-0"
                    animate={{ x: ['5%', '-5%', '5%'], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                    style={{ background: 'radial-gradient(ellipse at 65% 35%, rgba(100,5,5,0.4) 0%, transparent 50%)' }}
                />
            </motion.div>

            {/* Central light cone — follows mouse X */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: lightLeft,
                    transform: 'translateX(-50%)',
                    width: '30%',
                    height: '130%',
                    background: 'linear-gradient(180deg, rgba(160,0,0,0.35) 0%, rgba(80,0,0,0.15) 50%, transparent 100%)',
                    filter: 'blur(40px)',
                    opacity: lightOpacity,
                    willChange: 'transform',
                }}
            />

            {/* Blood drip horizontal glow at bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ height: '35%', background: 'linear-gradient(to top, rgba(120,0,0,0.5) 0%, rgba(80,0,0,0.2) 40%, transparent 100%)' }}
            />

            {/* Fine particles drifting upward */}
            {Array.from({ length: 20 }, (_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 2,
                        height: 2,
                        background: `rgba(${160 + Math.random() * 60}, 0, 0, 0.7)`,
                        left: `${Math.random() * 100}%`,
                        bottom: 0,
                    }}
                    animate={{ y: [0, -(300 + Math.random() * 400)], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 6 + Math.random() * 8, repeat: Infinity, delay: Math.random() * -10, ease: 'easeOut' }}
                />
            ))}

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.9) 100%)' }} />
        </div>
    )
})

BloodRitual.displayName = 'BloodRitual'
export default BloodRitual

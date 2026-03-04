import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * HeroArcLight — sweeping arc spotlight beam that follows mouse
 */
const HeroArcLight = memo(({ accent = '#a855f7' }) => {
    const rawX = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 18, damping: 20 })
    const beamLeft = useTransform(springX, [0, 1], ['15%', '85%'])
    const beamRotate = useTransform(springX, [0, 1], ['-15deg', '15deg'])

    useEffect(() => {
        const onMove = (e) => rawX.set(e.clientX / window.innerWidth)
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX])

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#030308' }}>
            {/* Dark base */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(20,5,40,0.7) 0%, transparent 60%)' }} />

            {/* Primary spotlight beam — follows mouse */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '-10%', left: beamLeft, translateX: '-50%',
                    rotate: beamRotate,
                    width: '28%', height: '110%',
                    background: `linear-gradient(180deg, ${accent}60 0%, ${accent}20 40%, transparent 100%)`,
                    filter: 'blur(25px)',
                    transformOrigin: 'top center',
                    willChange: 'transform',
                }}
            />

            {/* Secondary ghost beam */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '-10%', left: beamLeft, translateX: 'calc(-50% + 60px)',
                    rotate: beamRotate,
                    width: '14%', height: '90%',
                    background: `linear-gradient(180deg, ${accent}30 0%, transparent 70%)`,
                    filter: 'blur(15px)', transformOrigin: 'top center',
                }}
            />

            {/* Rim light effect — outer edge of beam */}
            <motion.div
                className="absolute pointer-events-none inset-y-0"
                style={{
                    left: beamLeft, translateX: '-50%',
                    width: '60%',
                    background: `radial-gradient(ellipse at 50% 0%, ${accent}15 0%, transparent 70%)`,
                    willChange: 'transform',
                }}
            />

            {/* Floor reflection when beam hits bottom */}
            <motion.div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                    height: '25%',
                    background: `linear-gradient(to top, ${accent}18 0%, transparent 100%)`,
                    filter: 'blur(8px)',
                }}
                animate={{ opacity: [0.5, 1, 0.6, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Dust motes in beam */}
            {Array.from({ length: 15 }, (_, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none bg-white"
                    style={{ width: 1, height: 1, left: `${35 + Math.random() * 30}%`, opacity: 0.3 }}
                    animate={{ y: [0, -(40 + Math.random() * 60)], x: [(Math.random() - 0.5) * 20], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * -4, ease: 'easeOut' }}
                />
            ))}

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: 'linear-gradient(to top, #030308 0%, transparent 100%)' }} />
        </div>
    )
})
HeroArcLight.displayName = 'HeroArcLight'
export default HeroArcLight

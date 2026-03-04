import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * HeroCyberMesh — dark hex-like grid with glowing pulse nodes
 * Mouse: brightens nearest node cluster
 */
const HeroCyberMesh = memo(({ accent = '#8b5cf6' }) => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 30, damping: 22 })
    const springY = useSpring(rawY, { stiffness: 30, damping: 22 })
    const glowLeft = useTransform(springX, [0, 1], ['0%', '100%'])
    const glowTop = useTransform(springY, [0, 1], ['0%', '100%'])

    useEffect(() => {
        const onMove = (e) => { rawX.set(e.clientX / window.innerWidth); rawY.set(e.clientY / window.innerHeight) }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #040410 0%, #080818 100%)' }}>
            {/* Hex-like grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `
          linear-gradient(to right, ${accent}18 1px, transparent 1px),
          linear-gradient(to bottom, ${accent}18 1px, transparent 1px)
        `,
                backgroundSize: '40px 40px',
            }} />

            {/* Diagonal accent lines */}
            <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent 0px, transparent 38px, ${accent}0a 38px, ${accent}0a 40px)`,
            }} />

            {/* Pulsing nodes */}
            {[
                { left: '15%', top: '30%', delay: 0 }, { left: '35%', top: '60%', delay: 0.8 },
                { left: '55%', top: '25%', delay: 1.6 }, { left: '75%', top: '55%', delay: 0.4 },
                { left: '92%', top: '35%', delay: 1.2 }, { left: '8%', top: '70%', delay: 2 },
            ].map((n, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none"
                    style={{
                        left: n.left, top: n.top, translateX: '-50%', translateY: '-50%',
                        width: 6, height: 6, background: accent,
                        boxShadow: `0 0 12px ${accent}, 0 0 30px ${accent}80`
                    }}
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: n.delay, ease: 'easeInOut' }}
                />
            ))}

            {/* Cursor glow */}
            <motion.div className="absolute pointer-events-none" style={{
                left: glowLeft, top: glowTop, translateX: '-50%', translateY: '-50%',
                width: 200, height: 200, borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                filter: 'blur(15px)', willChange: 'transform',
            }} />

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(to top, rgba(4,4,16,0.95) 0%, transparent 100%)' }} />
        </div>
    )
})
HeroCyberMesh.displayName = 'HeroCyberMesh'
export default HeroCyberMesh

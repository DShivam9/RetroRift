import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Mind Palace — infinite tunneling perspective grid converging to a vanishing point.
 * Mouse: vanishing point follows cursor, warping the tunnel
 */
const MindPalace = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 20, damping: 24 })
    const springY = useSpring(rawY, { stiffness: 20, damping: 24 })

    const vpX = useTransform(springX, [0, 1], ['35%', '65%'])
    const vpY = useTransform(springY, [0, 1], ['35%', '55%'])
    const glowX = useTransform(springX, [0, 1], ['0%', '100%'])
    const glowY = useTransform(springY, [0, 1], ['0%', '100%'])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    // Concentric rectangles shrinking toward vanishing point (simulated with divs)
    const rings = Array.from({ length: 14 }, (_, i) => {
        const scale = 1 - i * 0.065
        const opacity = 0.08 + i * 0.04
        return { scale, opacity, i }
    })

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#020206' }}>

            {/* Deep background gradient */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(40,0,80,0.5) 0%, rgba(10,0,30,0.5) 50%, transparent 100%)' }} />

            {/* Tunnel rings — perspective boxes centered at vanishing point */}
            <motion.div className="absolute inset-0" style={{ perspective: '800px' }}>
                {rings.map(r => (
                    <motion.div
                        key={r.i}
                        className="absolute border"
                        style={{
                            border: `1px solid rgba(160,80,255,${r.opacity})`,
                            boxShadow: `inset 0 0 ${r.i * 3}px rgba(120,50,255,${r.opacity * 0.3}), 0 0 ${r.i * 2}px rgba(160,80,255,${r.opacity * 0.2})`,
                            left: vpX,
                            top: vpY,
                            width: `${(r.i + 1) * 8}vw`,
                            height: `${(r.i + 1) * 8}vh`,
                            translateX: '-50%',
                            translateY: '-50%',
                            willChange: 'transform',
                        }}
                        animate={{ opacity: [r.opacity * 0.6, r.opacity, r.opacity * 0.6] }}
                        transition={{ duration: 4 + r.i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: r.i * 0.15 }}
                    />
                ))}
            </motion.div>

            {/* Travelling ring — zooms from vanishing point outward */}
            {Array.from({ length: 4 }, (_, i) => (
                <motion.div
                    key={i}
                    className="absolute border rounded-sm pointer-events-none"
                    style={{
                        borderColor: 'rgba(180,100,255,0.6)',
                        left: vpX,
                        top: vpY,
                        translateX: '-50%',
                        translateY: '-50%',
                        boxShadow: '0 0 20px rgba(160,80,255,0.4)',
                    }}
                    animate={{
                        width: ['0vw', '160vw'],
                        height: ['0vh', '160vh'],
                        opacity: [0.8, 0],
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.875, ease: [0.15, 0.85, 0.4, 1] }}
                />
            ))}

            {/* Cursor glow point */}
            <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: glowX,
                    top: glowY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(160,80,255,0.2) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                    willChange: 'transform',
                }}
            />

            {/* Rolling scanlines */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(100,50,180,0.03) 3px, rgba(100,50,180,0.03) 4px)',
            }} />

            {/* Vignette  */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 10%, rgba(0,0,0,0.92) 100%)' }} />
        </div>
    )
})

MindPalace.displayName = 'MindPalace'
export default MindPalace

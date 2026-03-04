import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Aurora Void — hyper-vivid aurora curtains on absolute black.
 * Mouse X: shifts the brightest aurora band position
 * Mouse Y: controls overall intensity
 */
const AuroraVoid = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 15, damping: 18 })
    const springY = useSpring(rawY, { stiffness: 15, damping: 18 })

    const band1X = useTransform(springX, [0, 1], ['-25%', '25%'])
    const band2X = useTransform(springX, [0, 1], ['15%', '-15%'])
    const intensity = useTransform(springY, [0, 1], [1, 0.35])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    const bands = [
        { gradient: 'linear-gradient(90deg, transparent 0%, rgba(0,255,150,0.7) 20%, rgba(0,220,120,0.55) 40%, rgba(80,255,200,0.6) 60%, rgba(0,200,180,0.45) 80%, transparent 100%)', translateX: band1X, height: '35vh', top: '5%', dur: 12, blur: 40 },
        { gradient: 'linear-gradient(90deg, transparent 5%, rgba(120,0,255,0.55) 25%, rgba(180,0,255,0.65) 45%, rgba(220,0,200,0.55) 65%, rgba(100,0,220,0.4) 85%, transparent 95%)', translateX: band2X, height: '28vh', top: '18%', dur: 17, blur: 45 },
        { gradient: 'linear-gradient(90deg, transparent 10%, rgba(0,180,255,0.45) 30%, rgba(0,220,255,0.55) 50%, rgba(0,200,240,0.4) 70%, transparent 90%)', translateX: band1X, height: '22vh', top: '0%', dur: 22, blur: 50 },
    ]

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">

            {/* Stars */}
            {Array.from({ length: 80 }, (_, i) => (
                <div key={i} className="absolute rounded-full bg-white"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 60}%`,
                        width: Math.random() > 0.85 ? 2 : 1,
                        height: Math.random() > 0.85 ? 2 : 1,
                        opacity: 0.2 + Math.random() * 0.6,
                    }}
                />
            ))}

            {/* Aurora bands */}
            <motion.div className="absolute inset-0" style={{ opacity: intensity }}>
                {bands.map((b, i) => (
                    <motion.div key={i}
                        className="absolute left-[-30%] right-[-30%] rounded-full"
                        style={{
                            top: b.top,
                            height: b.height,
                            background: b.gradient,
                            filter: `blur(${b.blur}px)`,
                            x: b.translateX,
                            willChange: 'transform',
                        }}
                        animate={{
                            scaleY: [0.7, 1.3, 0.8, 1.1, 0.7],
                            skewX: ['-3deg', '3deg', '-1deg', '2deg', '-3deg'],
                        }}
                        transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
                    />
                ))}
            </motion.div>

            {/* Extreme bottom glow */}
            <div className="absolute bottom-0 left-0 right-0" style={{ height: '40%', background: 'linear-gradient(to top, rgba(0,20,15,0.9) 0%, transparent 100%)' }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.88) 100%)' }} />
        </div>
    )
})

AuroraVoid.displayName = 'AuroraVoid'
export default AuroraVoid

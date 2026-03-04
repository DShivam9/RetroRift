import React, { memo, useEffect, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Frost Glass — crystalline ice fracture patterns
 * Mouse: creates a warm "melt" glow at cursor position, shifting ice colours
 */
const FrostGlass = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 30, damping: 24 })
    const springY = useSpring(rawY, { stiffness: 30, damping: 24 })

    const meltLeft = useTransform(springX, [0, 1], ['0%', '100%'])
    const meltTop = useTransform(springY, [0, 1], ['0%', '100%'])
    const panX = useTransform(springX, [0, 1], ['-3%', '3%'])
    const panY = useTransform(springY, [0, 1], ['-2%', '2%'])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    // Crystal polygon data
    const crystals = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: `${5 + (i % 4) * 25 + Math.random() * 10}%`,
        y: `${8 + Math.floor(i / 4) * 24 + Math.random() * 8}%`,
        size: 40 + Math.random() * 80,
        rotate: Math.random() * 360,
        dur: 8 + Math.random() * 12,
        delay: Math.random() * -10,
        opacity: 0.04 + Math.random() * 0.08,
    })), [])

    const clipPath = [
        'polygon(50% 0%, 85% 25%, 100% 70%, 65% 100%, 20% 95%, 0% 55%, 15% 15%)',
        'polygon(50% 0%, 90% 20%, 100% 65%, 70% 100%, 25% 100%, 0% 60%, 10% 20%)',
        'polygon(40% 0%, 90% 10%, 100% 60%, 80% 100%, 20% 100%, 0% 70%, 5% 20%)',
    ]

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#020408' }}>

            {/* Dark ice base gradients */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(40,60,100,0.4) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(20,40,80,0.3) 0%, transparent 50%)' }} />

            {/* Shifting crystal field */}
            <motion.div className="absolute inset-0" style={{ x: panX, y: panY }}>
                {crystals.map(c => (
                    <motion.div
                        key={c.id}
                        style={{
                            position: 'absolute',
                            left: c.x,
                            top: c.y,
                            width: c.size,
                            height: c.size,
                            clipPath: clipPath[c.id % 3],
                            background: `linear-gradient(${c.rotate}deg, rgba(150,200,255,${c.opacity}) 0%, rgba(80,140,200,${c.opacity * 0.6}) 50%, transparent 100%)`,
                            filter: 'blur(1px)',
                            willChange: 'transform, opacity',
                        }}
                        animate={{
                            opacity: [c.opacity, c.opacity * 2.5, c.opacity],
                            scale: [1, 1.05, 1],
                            rotate: [c.rotate, c.rotate + 8, c.rotate],
                        }}
                        transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
                    />
                ))}
            </motion.div>

            {/* Cursor warm melt glow */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '280px',
                    height: '280px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(150,200,255,0.12) 0%, rgba(100,160,240,0.06) 40%, transparent 70%)',
                    filter: 'blur(25px)',
                    left: meltLeft,
                    top: meltTop,
                    translate: '-50% -50%',
                    pointerEvents: 'none',
                    willChange: 'transform',
                }}
            />

            {/* Frost veins — thin diagonal lines */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            repeating-linear-gradient(-45deg, transparent 0px, transparent 60px, rgba(100,160,220,0.04) 60px, rgba(100,160,220,0.04) 61px),
            repeating-linear-gradient(45deg, transparent 0px, transparent 80px, rgba(80,140,200,0.03) 80px, rgba(80,140,200,0.03) 81px)
          `,
                }}
            />

            {/* Ambient breathing glow */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(100,160,255,0.06) 0%, transparent 60%)' }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.88) 100%)' }} />
        </div>
    )
})

FrostGlass.displayName = 'FrostGlass'
export default FrostGlass

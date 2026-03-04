import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Solar Storm — coronal plasma with arcing magnetic field lines.
 * Mouse: cursor position creates a local plasma concentration point
 */
const SolarStorm = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 22, damping: 20 })
    const springY = useSpring(rawY, { stiffness: 22, damping: 20 })

    const plasmaX = useTransform(springX, [0, 1], ['10%', '90%'])
    const plasmaY = useTransform(springY, [0, 1], ['10%', '90%'])
    const coronaX = useTransform(springX, [0, 1], ['-8%', '8%'])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    const loops = [
        { cx: 40, cy: 70, rx: 18, ry: 30, stroke: 'rgba(255,180,50,0.8)', dur: 5, delay: 0 },
        { cx: 60, cy: 65, rx: 22, ry: 35, stroke: 'rgba(255,130,30,0.7)', dur: 7, delay: 1 },
        { cx: 25, cy: 72, rx: 14, ry: 22, stroke: 'rgba(255,200,80,0.6)', dur: 4, delay: 2 },
        { cx: 75, cy: 68, rx: 20, ry: 28, stroke: 'rgba(255,100,20,0.7)', dur: 6, delay: 0.5 },
        { cx: 50, cy: 60, rx: 28, ry: 42, stroke: 'rgba(255,160,40,0.5)', dur: 9, delay: 3 },
    ]

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#000' }}>

            {/* Solar corona base */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse 70% 55% at 50% 110%, rgba(255,120,0,0.4) 0%, rgba(180,50,0,0.25) 30%, rgba(60,10,0,0.15) 60%, transparent 100%)'
            }} />

            {/* Chromosphere */}
            <div className="absolute bottom-0 left-0 right-0" style={{
                height: '25%',
                background: 'linear-gradient(to top, rgba(255,60,0,0.5) 0%, rgba(255,120,0,0.3) 40%, transparent 100%)',
                filter: 'blur(8px)',
            }} />

            {/* Plasma loops (SVG arcs that oscillate) */}
            <motion.div className="absolute inset-0" style={{ x: coronaX }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {loops.map((l, i) => (
                        <motion.ellipse
                            key={i}
                            cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry}
                            fill="none"
                            stroke={l.stroke}
                            strokeWidth="0.6"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.9, 0.9, 0], scaleY: [0.6, 1, 1.2, 0.6] }}
                            transition={{ duration: l.dur, repeat: Infinity, delay: l.delay, ease: 'easeInOut' }}
                            filter="url(#plasmaGlow)"
                        />
                    ))}
                    <defs>
                        <filter id="plasmaGlow">
                            <feGaussianBlur stdDeviation="0.8" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                </svg>
            </motion.div>

            {/* Cursor plasma concentration */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    left: plasmaX,
                    top: plasmaY,
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,200,60,0.25) 0%, rgba(255,120,0,0.12) 40%, transparent 70%)',
                    filter: 'blur(20px)',
                    translate: '-50% -50%',
                    willChange: 'transform',
                }}
            />

            {/* Particle flares */}
            {Array.from({ length: 30 }, (_, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 1 + Math.random() * 2,
                        height: 1 + Math.random() * 2,
                        background: `hsl(${20 + Math.random() * 40}, 100%, ${60 + Math.random() * 30}%)`,
                        bottom: `${Math.random() * 35}%`,
                        left: `${Math.random() * 100}%`,
                        boxShadow: `0 0 4px rgba(255,150,50,0.8)`,
                    }}
                    animate={{
                        y: [0, -(80 + Math.random() * 200)],
                        x: [0, (Math.random() - 0.5) * 60],
                        opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * -4, ease: 'easeOut' }}
                />
            ))}

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.9) 100%)' }} />
        </div>
    )
})

SolarStorm.displayName = 'SolarStorm'
export default SolarStorm

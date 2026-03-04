import React, { memo, useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

/**
 * The Abyss — Tailwind CSS rewrite. Pure monochrome deep void.
 * Hover: Sonar ping ripple rings emit from cursor on click/move
 */
const TheAbyss = memo(() => {
    const containerRef = useRef(null)
    const [pings, setPings] = useState([])
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 18, damping: 20 })
    const springY = useSpring(rawY, { stiffness: 18, damping: 20 })

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        // Sonar ping on click
        const onClick = (e) => {
            const id = Date.now()
            setPings(p => [...p, { id, x: e.clientX, y: e.clientY }])
            setTimeout(() => setPings(p => p.filter(ping => ping.id !== id)), 2200)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        window.addEventListener('click', onClick)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('click', onClick)
        }
    }, [rawX, rawY])

    // Depth layers of white specks
    const specks = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() > 0.85 ? 2 : 1,
        opacity: 0.05 + Math.random() * 0.35,
        dur: 4 + Math.random() * 12,
        delay: Math.random() * -12,
    }))

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black">

            {/* Deep void gradient */}
            <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 60%, #06060f 0%, #000 65%)' }}
            />

            {/* Atmospheric depth layer */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 50% 40% at 50% 80%, rgba(20,20,40,0.5) 0%, transparent 100%)',
                    x: useSpring(useMotionValue(0)),
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Depth specks — floating white dust */}
            {specks.map(s => (
                <motion.div
                    key={s.id}
                    className="absolute rounded-full bg-white pointer-events-none"
                    style={{
                        left: s.left,
                        top: s.top,
                        width: s.size,
                        height: s.size,
                        boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,${s.opacity})`,
                    }}
                    animate={{ opacity: [0, s.opacity, s.opacity * 0.3, 0] }}
                    transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
                />
            ))}

            {/* Cursor depth ripple (slow, passive) */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.04)',
                    x: useSpring(useMotionValue(0)),
                    left: springX.get() * window.innerWidth - 200,
                    top: springY.get() * window.innerHeight - 200,
                    translateX: '-0px',
                }}
            />

            {/* Sonar pings on click */}
            <AnimatePresence>
                {pings.map(ping => (
                    <React.Fragment key={ping.id}>
                        {[0, 0.3, 0.6].map((delay, di) => (
                            <motion.div
                                key={`${ping.id}-${di}`}
                                className="absolute pointer-events-none rounded-full border border-white"
                                style={{
                                    left: ping.x,
                                    top: ping.y,
                                    width: 0,
                                    height: 0,
                                    translateX: '-50%',
                                    translateY: '-50%',
                                }}
                                initial={{ width: 0, height: 0, opacity: 0.5, borderColor: 'rgba(255,255,255,0.5)' }}
                                animate={{ width: 400, height: 400, opacity: 0, borderColor: 'rgba(255,255,255,0)' }}
                                transition={{ duration: 1.8, delay, ease: [0.2, 0.8, 0.4, 1] }}
                                exit={{ opacity: 0 }}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </AnimatePresence>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.92) 100%)' }} />
        </div>
    )
})

TheAbyss.displayName = 'TheAbyss'
export default TheAbyss

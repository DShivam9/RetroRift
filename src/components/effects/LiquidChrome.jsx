import React, { memo, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Liquid Chrome — metallic mercury blobs that respond to cursor
 * Mouse: creates a gravitational pull effect near the cursor position
 */
const LiquidChrome = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 20, damping: 18 })
    const springY = useSpring(rawY, { stiffness: 20, damping: 18 })

    const cursorLeft = useTransform(springX, [0, 1], ['0%', '100%'])
    const cursorTop = useTransform(springY, [0, 1], ['0%', '100%'])

    // Individual blob parallax multipliers
    const b1x = useTransform(springX, [0, 1], ['-8%', '8%'])
    const b1y = useTransform(springY, [0, 1], ['-6%', '6%'])
    const b2x = useTransform(springX, [0, 1], ['6%', '-6%'])
    const b2y = useTransform(springY, [0, 1], ['5%', '-5%'])
    const b3x = useTransform(springX, [0, 1], ['-5%', '5%'])
    const b3y = useTransform(springY, [0, 1], ['4%', '-4%'])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    const blobBase = {
        position: 'absolute',
        borderRadius: '50%',
        mixBlendMode: 'screen',
        filter: 'blur(50px)',
        willChange: 'transform',
    }

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#030308' }}>

            {/* Blob 1 — silver-white */}
            <motion.div
                style={{ ...blobBase, top: '15%', left: '20%', width: '55vw', height: '55vw', maxWidth: '700px', maxHeight: '700px', background: 'radial-gradient(circle, rgba(220,230,255,0.18) 0%, rgba(160,170,210,0.1) 40%, transparent 70%)', x: b1x, y: b1y }}
                animate={{ scale: [1, 1.12, 0.95, 1], rotate: [0, 15, -8, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Blob 2 — warm steel */}
            <motion.div
                style={{ ...blobBase, bottom: '10%', right: '10%', width: '50vw', height: '50vw', maxWidth: '650px', maxHeight: '650px', background: 'radial-gradient(circle, rgba(180,190,230,0.16) 0%, rgba(140,150,200,0.08) 40%, transparent 70%)', x: b2x, y: b2y }}
                animate={{ scale: [1.1, 0.92, 1.08, 1.1], rotate: [0, -12, 10, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />

            {/* Blob 3 — cool highlight */}
            <motion.div
                style={{ ...blobBase, top: '40%', left: '40%', width: '35vw', height: '35vw', maxWidth: '450px', maxHeight: '450px', background: 'radial-gradient(circle, rgba(200,210,255,0.22) 0%, transparent 65%)', x: b3x, y: b3y }}
                animate={{ scale: [0.9, 1.15, 0.9], rotate: [5, -5, 5] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            />

            {/* Cursor magnetic glow */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(200,215,255,0.12) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                    left: cursorLeft,
                    top: cursorTop,
                    translate: '-50% -50%',
                    pointerEvents: 'none',
                    willChange: 'transform',
                }}
            />

            {/* Fine chrome grain */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                    mixBlendMode: 'overlay',
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
        </div>
    )
})

LiquidChrome.displayName = 'LiquidChrome'
export default LiquidChrome

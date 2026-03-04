import React, { memo, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Outrun Grid — Synthwave perspective grid with interactive sun
 * Mouse X: shifts the grid perspective
 * Mouse Y: controls sun height + sky colour shift
 */
const SynthwaveGrid = memo(() => {
    const containerRef = useRef(null)
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 40, damping: 25 })
    const springY = useSpring(rawY, { stiffness: 40, damping: 25 })

    const gridTranslateX = useTransform(springX, [0, 1], ['12%', '-12%'])
    const sunY = useTransform(springY, [0, 1], ['22%', '52%'])
    const sunOpacity = useTransform(springY, [0, 1], [1, 0.55])
    const skyIntensity = useTransform(springY, [0, 1], [0.9, 0.5])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">

            {/* Sky gradient */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, #0a0010 0%, #1a0035 25%, #3d0060 45%, #800090 58%, #ff3090 68%, #ff8000 78%, #ffcc00 88%, #1a0035 100%)',
                    opacity: skyIntensity
                }}
            />

            {/* Sun disk */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                    top: sunY,
                    opacity: sunOpacity,
                    width: '28vw',
                    height: '28vw',
                    maxWidth: '320px',
                    maxHeight: '320px',
                    background: 'radial-gradient(circle, #fff5c0 0%, #ffdd60 20%, #ff9940 50%, #ff5520 70%, transparent 100%)',
                    filter: 'blur(1px)',
                    boxShadow: '0 0 80px 40px rgba(255,120,40,0.4), 0 0 200px 100px rgba(255,80,0,0.15)',
                    willChange: 'transform',
                }}
            />

            {/* Sun horizontal scan lines */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-full"
                style={{
                    top: sunY,
                    opacity: sunOpacity,
                    width: '28vw',
                    height: '28vw',
                    maxWidth: '320px',
                    maxHeight: '320px',
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(80,0,0,0.25) 0px, rgba(80,0,0,0.25) 3px, transparent 3px, transparent 9px)',
                }}
            />

            {/* Horizon glow bar */}
            <div
                className="absolute left-0 right-0"
                style={{
                    top: '68%',
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, #ff30c0, #ff80ff, #ff30c0, transparent)',
                    boxShadow: '0 0 30px 10px rgba(255,100,220,0.5)',
                    filter: 'blur(1px)',
                }}
            />

            {/* Perspective grid */}
            <div className="absolute left-0 right-0 bottom-0" style={{ top: '68%', perspective: '600px' }}>
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(to bottom, rgba(255,50,200,0.9) 1px, transparent 1px),
              linear-gradient(to right,  rgba(255,50,200,0.6) 1px, transparent 1px)
            `,
                        backgroundSize: '10% 100px',
                        transform: 'perspective(600px) rotateX(60deg)',
                        transformOrigin: 'top center',
                        translateX: gridTranslateX,
                    }}
                />
                {/* Grid fade at bottom */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, #000 95%)' }}
                />
            </div>

            {/* Scan line overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)',
                }}
            />
        </div>
    )
})

SynthwaveGrid.displayName = 'SynthwaveGrid'
export default SynthwaveGrid

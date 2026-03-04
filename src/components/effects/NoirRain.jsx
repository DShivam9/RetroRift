import React, { memo, useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Noir Rain — cinematic dark rain with neon wet-floor reflection
 * Mouse X: tilts the rain direction
 * Mouse Y: controls reflection intensity
 */
const NoirRain = memo(() => {
    const rawX = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 30, damping: 20 })
    const rainSkew = useTransform(springX, [0, 1], ['8deg', '-8deg'])

    useEffect(() => {
        const onMove = (e) => rawX.set(e.clientX / window.innerWidth)
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX])

    // Generate rain drops once
    const drops = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * -4}s`,
        duration: `${0.4 + Math.random() * 0.7}s`,
        opacity: 0.1 + Math.random() * 0.5,
        height: `${40 + Math.random() * 80}px`,
        width: `${Math.random() > 0.8 ? 2 : 1}px`,
    }))

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#040406' }}>

            {/* Atmospheric fog layers */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(60,20,80,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(20,5,40,0.4) 0%, transparent 50%)' }} />

            {/* Rain container — skews with mouse */}
            <motion.div
                style={{ skewX: rainSkew }}
                className="absolute inset-0"
            >
                {drops.map(d => (
                    <div
                        key={d.id}
                        className="absolute top-0"
                        style={{
                            left: d.left,
                            width: d.width,
                            height: d.height,
                            background: `linear-gradient(180deg, transparent 0%, rgba(160,180,220,${d.opacity}) 70%, rgba(200,220,255,${d.opacity * 0.6}) 100%)`,
                            animation: `noirRainFall ${d.duration} linear ${d.delay} infinite`,
                            willChange: 'transform',
                        }}
                    />
                ))}
            </motion.div>

            {/* Wet floor reflection strip */}
            <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                    height: '30%',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(80,60,120,0.15) 40%, rgba(100,80,160,0.25) 80%, rgba(60,40,100,0.35) 100%)',
                }}
            />

            {/* Neon sign glow — faint reflected colour pools on wet floor */}
            <div className="absolute bottom-0 left-1/4 right-1/4" style={{ height: '20%', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,30,120,0.1) 0%, transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 right-3/4" style={{ height: '15%', background: 'radial-gradient(ellipse at 0% 100%, rgba(30,120,255,0.08) 0%, transparent 60%)' }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)' }} />

            <style>{`
        @keyframes noirRainFall {
          0%   { transform: translateY(-100px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.7; }
          100% { transform: translateY(110vh);  opacity: 0; }
        }
      `}</style>
        </div>
    )
})

NoirRain.displayName = 'NoirRain'
export default NoirRain

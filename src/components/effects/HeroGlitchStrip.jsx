import React, { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * HeroGlitchStrip — horizontal glitch bands that periodically scan and scramble
 * Click/hover: triggers an immediate glitch burst
 */
const HeroGlitchStrip = memo(({ accent = '#00ff88' }) => {
    const [glitching, setGlitching] = useState(false)

    useEffect(() => {
        // Auto glitch every 4-7s
        const doGlitch = () => {
            setGlitching(true)
            setTimeout(() => setGlitching(false), 500)
        }
        doGlitch()
        const iv = setInterval(doGlitch, 4000 + Math.random() * 3000)
        return () => clearInterval(iv)
    }, [])

    const bars = Array.from({ length: 8 }, (_, i) => ({
        top: `${5 + i * 11}%`,
        height: `${4 + Math.random() * 6}%`,
        delay: Math.random() * 0.1,
    }))

    return (
        <div className="absolute inset-0 overflow-hidden cursor-pointer" style={{ background: '#040408' }}
            onClick={() => { setGlitching(true); setTimeout(() => setGlitching(false), 400) }}>

            {/* Scanline base */}
            <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
            }} />

            {/* Subtle base colour */}
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${accent}10 0%, transparent 70%)` }} />

            {/* Glitch bars */}
            <AnimatePresence>
                {glitching && bars.map((b, i) => (
                    <motion.div key={i}
                        className="absolute inset-x-0 pointer-events-none"
                        style={{
                            top: b.top, height: b.height,
                            background: `linear-gradient(90deg, transparent ${(i * 15) % 40}%, ${accent}30 ${(i * 15) % 40 + 20}%, rgba(255,0,100,0.15) ${(i * 15) % 40 + 35}%, transparent 60%)`,
                            mixBlendMode: 'screen',
                        }}
                        initial={{ opacity: 0, x: 0 }}
                        animate={{ opacity: [0, 1, 0.6, 1, 0], x: [0, -8 + i * 3, 5, -3, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: b.delay, ease: 'steps(4)' }}
                    />
                ))}
            </AnimatePresence>

            {/* RGB horizontal shift bars (always subtle) */}
            <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ opacity: glitching ? [0, 0.6, 0] : 0.08 }}
                transition={{ duration: 0.4 }}
                style={{
                    background: `repeating-linear-gradient(0deg, transparent 0px, transparent 8px, ${accent}08 8px, ${accent}08 9px)`,
                }} />

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: 'linear-gradient(to top, #040408 0%, transparent 100%)' }} />

            {/* Hint text */}
            <div className="absolute bottom-2 right-3 text-xs font-mono opacity-20 pointer-events-none"
                style={{ color: accent }}>CLICK TO GLITCH</div>
        </div>
    )
})
HeroGlitchStrip.displayName = 'HeroGlitchStrip'
export default HeroGlitchStrip

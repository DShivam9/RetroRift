import React, { memo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * HeroVaporPrism — iridescent light prism / spectrum bands shifting on mouse
 */
const HeroVaporPrism = memo(({ accent = '#8b5cf6' }) => {
    const rawX = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 20, damping: 20 })
    const shift = useTransform(springX, [0, 1], ['-15%', '15%'])

    useEffect(() => {
        const onMove = (e) => rawX.set(e.clientX / window.innerWidth)
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX])

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#030308' }}>
            {/* Base dark gradient */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(30,5,60,0.8) 0%, transparent 70%)' }} />

            {/* Prismatic bands — shift with mouse */}
            <motion.div className="absolute inset-0 pointer-events-none" style={{ x: shift }}>
                {[
                    { angle: '-20deg', color: 'rgba(255,0,128,0.18)', left: '10%', width: '20%' },
                    { angle: '-15deg', color: 'rgba(180,0,255,0.16)', left: '25%', width: '18%' },
                    { angle: '-18deg', color: 'rgba(80,0,255,0.14)', left: '38%', width: '16%' },
                    { angle: '-16deg', color: 'rgba(0,120,255,0.15)', left: '50%', width: '14%' },
                    { angle: '-19deg', color: 'rgba(0,220,180,0.14)', left: '61%', width: '18%' },
                    { angle: '-17deg', color: 'rgba(0,255,120,0.12)', left: '75%', width: '15%' },
                ].map((b, i) => (
                    <motion.div key={i}
                        className="absolute inset-y-0 pointer-events-none"
                        style={{
                            left: b.left, width: b.width,
                            background: `linear-gradient(${b.angle}, transparent 0%, ${b.color} 40%, transparent 100%)`,
                            filter: 'blur(18px)',
                        }}
                        animate={{ opacity: [0.5, 1, 0.7, 1, 0.5] }}
                        transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    />
                ))}
            </motion.div>

            {/* Fine shimmer — thin white streak */}
            <motion.div
                className="absolute inset-y-0 pointer-events-none"
                style={{ width: 2, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.5), transparent)', filter: 'blur(3px)', willChange: 'transform', left: 0 }}
                animate={{ left: ['-5%', '105%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            />

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: 'linear-gradient(to top, rgba(3,3,8,1) 0%, transparent 100%)' }} />
        </div>
    )
})
HeroVaporPrism.displayName = 'HeroVaporPrism'
export default HeroVaporPrism

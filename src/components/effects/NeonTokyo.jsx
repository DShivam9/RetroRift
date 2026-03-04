import React, { memo, useEffect, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Neon Tokyo — Cyberpunk city at night.
 * Multi-layer parallax: distant skyline + mid-buildings + neon signs + rain + wet floor reflection
 * Mouse: shifts each layer at different parallax depths
 */
const NeonTokyo = memo(() => {
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const springX = useSpring(rawX, { stiffness: 25, damping: 22 })
    const springY = useSpring(rawY, { stiffness: 25, damping: 22 })

    // Parallax layers — near layers move more
    const far = useTransform(springX, [0, 1], ['-2%', '2%'])
    const mid = useTransform(springX, [0, 1], ['-5%', '5%'])
    const near = useTransform(springX, [0, 1], ['-9%', '9%'])

    useEffect(() => {
        const onMove = (e) => {
            rawX.set(e.clientX / window.innerWidth)
            rawY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [rawX, rawY])

    const rainDrops = useMemo(() => Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 120 - 10}%`,
        delay: `${Math.random() * -3}s`,
        dur: `${0.3 + Math.random() * 0.4}s`,
        opacity: 0.08 + Math.random() * 0.3,
        height: `${30 + Math.random() * 60}px`,
    })), [])

    // Building silhouette data
    const farBuildings = [10, 18, 8, 25, 12, 20, 14, 22, 9, 16, 24, 11, 19, 7, 15, 21, 13, 17]
    const nearBuildings = [30, 22, 35, 28, 40, 18, 45, 25, 32, 38, 20, 42]

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#010105' }}>

            {/* Night sky gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #01010a 0%, #050115 35%, #0a0220 60%, #15031a 80%, #000 100%)' }} />

            {/* Atmospheric city haze */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 75%, rgba(60,10,80,0.35) 0%, transparent 60%)' }} />

            {/* ── FAR skyline ── */}
            <motion.div className="absolute bottom-0 left-0 right-0" style={{ height: '55%', x: far }}>
                <svg width="200%" height="100%" viewBox="0 0 2000 400" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-[-50%]">
                    {farBuildings.map((h, i) => (
                        <rect key={i} x={i * 112} y={400 - h * 8} width={90} height={h * 8}
                            fill={i % 3 === 0 ? '#0d1128' : i % 3 === 1 ? '#080e1e' : '#050a18'} />
                    ))}
                    {/* Windows — small grid */}
                    {farBuildings.map((h, i) =>
                        Array.from({ length: Math.floor(h / 3) }, (_, r) =>
                            Array.from({ length: 5 }, (_, c) => (
                                <rect key={`w-${i}-${r}-${c}`}
                                    x={i * 112 + 10 + c * 16} y={400 - h * 8 + r * 20 + 8}
                                    width={8} height={10}
                                    fill={Math.random() > 0.55 ? 'rgba(255,230,150,0.7)' : 'rgba(150,200,255,0.5)'}
                                    opacity={Math.random() > 0.4 ? 0.8 : 0}
                                />
                            ))
                        )
                    )}
                </svg>
            </motion.div>

            {/* ── NEAR buildings ── */}
            <motion.div className="absolute bottom-0 left-0 right-0" style={{ height: '65%', x: near }}>
                <svg width="130%" height="100%" viewBox="0 0 1400 600" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-[-15%]">
                    {nearBuildings.map((h, i) => (
                        <rect key={i} x={i * 118} y={600 - h * 10} width={100} height={h * 10} fill="#030309" />
                    ))}
                    {/* Neon sign glows */}
                    <rect x={50} y={300} width={80} height={12} rx={4} fill="rgba(255,30,100,0.9)" />
                    <rect x={240} y={240} width={70} height={10} rx={3} fill="rgba(30,200,255,0.8)" />
                    <rect x={500} y={280} width={90} height={12} rx={4} fill="rgba(180,30,255,0.8)" />
                    <rect x={750} y={220} width={60} height={10} rx={3} fill="rgba(255,160,30,0.8)" />
                    <rect x={950} y={260} width={80} height={12} rx={4} fill="rgba(30,255,180,0.7)" />
                </svg>
            </motion.div>

            {/* ── Neon sign glow halos ── */}
            <motion.div className="absolute inset-0 pointer-events-none" style={{ x: near }}>
                {[
                    { l: '5%', t: '42%', c: 'rgba(255,30,100,0.25)', w: 160 },
                    { l: '22%', t: '38%', c: 'rgba(30,200,255,0.2)', w: 120 },
                    { l: '42%', t: '40%', c: 'rgba(160,20,255,0.2)', w: 150 },
                    { l: '58%', t: '36%', c: 'rgba(255,150,20,0.2)', w: 100 },
                    { l: '74%', t: '39%', c: 'rgba(20,255,180,0.18)', w: 130 },
                ].map((g, i) => (
                    <motion.div key={i} className="absolute rounded-full"
                        style={{ left: g.l, top: g.t, width: g.w, height: 30, background: `radial-gradient(ellipse, ${g.c} 0%, transparent 70%)`, filter: 'blur(12px)', transform: 'translateX(-50%)', translateY: '-50%' }}
                        animate={{ opacity: [0.5, 1, 0.7, 1, 0.5] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </motion.div>

            {/* ── Rain ── */}
            <motion.div className="absolute inset-0" style={{ x: mid }}>
                {rainDrops.map(d => (
                    <div key={d.id} className="absolute top-0 w-px"
                        style={{
                            left: d.left,
                            height: d.height,
                            background: `linear-gradient(180deg, transparent, rgba(160,190,240,${d.opacity}))`,
                            animation: `neonRainFall ${d.dur} linear ${d.delay} infinite`,
                        }}
                    />
                ))}
            </motion.div>

            {/* ── Wet floor glow reflections ── */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4" style={{ background: 'linear-gradient(to top, rgba(5,0,12,0.98) 0%, rgba(8,2,18,0.6) 60%, transparent 100%)' }} />
            {[
                { l: '8%', c: 'rgba(255,30,100,0.12)' },
                { l: '25%', c: 'rgba(30,200,255,0.1)' },
                { l: '45%', c: 'rgba(160,20,255,0.1)' },
                { l: '60%', c: 'rgba(255,150,20,0.1)' },
                { l: '76%', c: 'rgba(20,255,180,0.08)' },
            ].map((r, i) => (
                <div key={i} className="absolute bottom-0"
                    style={{ left: r.l, width: '14%', height: '18%', background: `radial-gradient(ellipse at 50% 100%, ${r.c} 0%, transparent 70%)`, filter: 'blur(8px)' }}
                />
            ))}

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.85) 100%)' }} />

            <style>{`@keyframes neonRainFall { 0%{transform:translateY(-100px);opacity:0} 5%{opacity:1} 95%{opacity:.7} 100%{transform:translateY(110vh);opacity:0} }`}</style>
        </div>
    )
})

NeonTokyo.displayName = 'NeonTokyo'
export default NeonTokyo

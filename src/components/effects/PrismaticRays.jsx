import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * PrismaticRays – background-motion skill compliant hero banner
 * - Pure looping opacity + rotate transforms only
 * - Designed to sit inside the Hero Banner container (not fullscreen)
 */
const PrismaticRays = memo(({ color = '#f97316' }) => {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background: `linear-gradient(180deg, #0a0a12 0%, color-mix(in srgb, ${color} 8%, #0a0a12) 100%)`,
            }}
        >
            {/* Ray 1 */}
            <motion.div
                animate={{
                    rotate: [12, 22, 12],
                    opacity: [0.35, 0.65, 0.35],
                    x: ['-5%', '5%', '-5%'],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    top: '-60%',
                    left: '15%',
                    width: '18%',
                    height: '250%',
                    background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 50%, transparent), transparent)`,
                    filter: 'blur(25px)',
                    transformOrigin: 'top center',
                    willChange: 'transform, opacity',
                }}
            />

            {/* Ray 2 */}
            <motion.div
                animate={{
                    rotate: [-18, -8, -18],
                    opacity: [0.25, 0.55, 0.25],
                    x: ['5%', '-5%', '5%'],
                }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                style={{
                    position: 'absolute',
                    top: '-60%',
                    right: '20%',
                    width: '14%',
                    height: '250%',
                    background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 40%, #fff 20%), transparent)`,
                    filter: 'blur(35px)',
                    transformOrigin: 'top center',
                    willChange: 'transform, opacity',
                }}
            />

            {/* Ray 3 — thin bright accent */}
            <motion.div
                animate={{
                    rotate: [5, 15, 5],
                    opacity: [0.15, 0.45, 0.15],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                style={{
                    position: 'absolute',
                    top: '-60%',
                    left: '45%',
                    width: '8%',
                    height: '250%',
                    background: `linear-gradient(90deg, transparent, white, transparent)`,
                    filter: 'blur(20px)',
                    transformOrigin: 'top center',
                    willChange: 'transform, opacity',
                }}
            />

            {/* Base radial glow top */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse at 50% -20%, color-mix(in srgb, ${color} 25%, transparent) 0%, transparent 60%)`,
                }}
            />
        </div>
    );
});

PrismaticRays.displayName = 'PrismaticRays';
export default PrismaticRays;

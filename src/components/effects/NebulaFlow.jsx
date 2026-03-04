import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * NebulaFlow – background-motion skill compliant
 * - No useScroll (would break inside custom scroll containers)
 * - Pure looping transforms only (x, y, scale) → zero layout thrashing
 * - React.memo to prevent re-renders on profile state changes
 */
const NebulaFlow = memo(({ color = '#8b5cf6' }) => {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background: '#05050d',
            }}
        >
            {/* Blob 1 — slow, large, centre-left */}
            <motion.div
                animate={{
                    x: ['-8%', '8%', '-8%'],
                    y: ['-8%', '12%', '-8%'],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '15%',
                    width: '65vw',
                    height: '65vw',
                    maxWidth: '900px',
                    maxHeight: '900px',
                    background: `radial-gradient(circle, color-mix(in srgb, ${color} 35%, transparent) 0%, transparent 68%)`,
                    filter: 'blur(80px)',
                    borderRadius: '50%',
                    willChange: 'transform',
                }}
            />

            {/* Blob 2 — medium speed, bottom-right */}
            <motion.div
                animate={{
                    x: ['15%', '-8%', '15%'],
                    y: ['8%', '-15%', '8%'],
                    scale: [1.1, 0.9, 1.1],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 3,
                }}
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '5%',
                    width: '55vw',
                    height: '55vw',
                    maxWidth: '750px',
                    maxHeight: '750px',
                    background: `radial-gradient(circle, color-mix(in srgb, ${color} 22%, transparent) 0%, transparent 60%)`,
                    filter: 'blur(100px)',
                    borderRadius: '50%',
                    willChange: 'transform',
                }}
            />

            {/* Blob 3 — accent highlight, top-right */}
            <motion.div
                animate={{
                    x: ['-5%', '12%', '-5%'],
                    y: ['5%', '-10%', '5%'],
                    scale: [0.9, 1.05, 0.9],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 6,
                }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    right: '20%',
                    width: '30vw',
                    height: '30vw',
                    maxWidth: '400px',
                    maxHeight: '400px',
                    background: `radial-gradient(circle, color-mix(in srgb, ${color} 50%, #ff69b4 50%) 0%, transparent 70%)`,
                    filter: 'blur(60px)',
                    borderRadius: '50%',
                    willChange: 'transform, opacity',
                }}
            />
        </div>
    );
});

NebulaFlow.displayName = 'NebulaFlow';
export default NebulaFlow;

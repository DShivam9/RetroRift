import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * QuantumGrid – background-motion skill compliant
 * - Pure looping transforms for GPU compositing
 * - CSS gradient grid (no SVG overhead)
 * - Staggered pulsing nodes via motion variants
 */
const QuantumGrid = memo(({ accent = '#22d3ee' }) => {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background: '#030310',
            }}
        >
            {/* Perspective Grid layer */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-50%',
                    backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, ${accent} 18%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, ${accent} 18%, transparent) 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                    transform: 'perspective(800px) rotateX(40deg) scale(2)',
                    transformOrigin: '50% 0%',
                    opacity: 0.6,
                }}
            />

            {/* Floor gradient horizon glow */}
            <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: `linear-gradient(to top, color-mix(in srgb, ${accent} 30%, transparent), transparent)`,
                    willChange: 'opacity',
                }}
            />

            {/* Vertical scan lines */}
            <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 2 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
                    filter: `blur(3px) drop-shadow(0 0 8px ${accent})`,
                    willChange: 'transform',
                }}
            />

            {/* Pulsing centre node */}
            <motion.div
                animate={{
                    scale: [1, 2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '200px',
                    height: '200px',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, color-mix(in srgb, ${accent} 40%, transparent), transparent 70%)`,
                    borderRadius: '50%',
                    willChange: 'transform, opacity',
                }}
            />
        </div>
    );
});

QuantumGrid.displayName = 'QuantumGrid';
export default QuantumGrid;

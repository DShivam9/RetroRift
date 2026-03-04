import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * HoloWaves – background-motion skill compliant hero banner
 * - SVG path morphing via framer-motion for smooth fluid wave effect
 * - Visible base colour so it always has content even before animation loads
 * - React.memo for performance
 */
const HoloWaves = memo(({ color = '#3b82f6' }) => {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background: `linear-gradient(180deg, #070715 0%, color-mix(in srgb, ${color} 12%, #070715) 100%)`,
            }}
        >
            {/* Ambient top radial glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${color} 25%, transparent) 0%, transparent 70%)`,
                }}
            />

            {/* Wave SVG layer 1 — primary */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 160"
                preserveAspectRatio="none"
                style={{ position: 'absolute', bottom: 0, left: 0 }}
            >
                <motion.path
                    d="M0 80 C 360 130, 1080 30, 1440 80 L 1440 160 L 0 160 Z"
                    fill={`color-mix(in srgb, ${color} 25%, transparent)`}
                    animate={{
                        d: [
                            'M0 80 C 360 130, 1080 30, 1440 80 L 1440 160 L 0 160 Z',
                            'M0 80 C 360 30, 1080 130, 1440 80 L 1440 160 L 0 160 Z',
                            'M0 80 C 360 130, 1080 30, 1440 80 L 1440 160 L 0 160 Z',
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
            </svg>

            {/* Wave SVG layer 2 — secondary, offset */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 160"
                preserveAspectRatio="none"
                style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.6 }}
            >
                <motion.path
                    d="M0 100 C 480 50, 960 150, 1440 100 L 1440 160 L 0 160 Z"
                    fill={`color-mix(in srgb, ${color} 15%, transparent)`}
                    animate={{
                        d: [
                            'M0 100 C 480 50, 960 150, 1440 100 L 1440 160 L 0 160 Z',
                            'M0 100 C 480 150, 960 50, 1440 100 L 1440 160 L 0 160 Z',
                            'M0 100 C 480 50, 960 150, 1440 100 L 1440 160 L 0 160 Z',
                        ],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
            </svg>

            {/* scanline texture overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)`,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
});

HoloWaves.displayName = 'HoloWaves';
export default HoloWaves;

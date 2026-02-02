import React from "react"
import { motion } from "motion/react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function ProgressiveBlur({
    variants,
    animate,
    transition,
    className,
    blurIntensity = 0.5,
}) {
    const layers = 8
    const maxBlur = 20 * blurIntensity // Cap max blur

    return (
        <motion.div
            className={cn("relative", className)}
            variants={variants}
            animate={animate}
            transition={transition}
        >
            {[...Array(layers)].map((_, i) => {
                const index = i
                // blur amount increases with layer
                const blur = (index + 1) * (maxBlur / layers)

                // Gradient mask:
                // Each layer covers a slice, or stacks?
                // Standard progressive blur stacks them.
                // Layer 0 (small blur): Mask gradient starts at 0%
                // Layer 7 (high blur): Mask gradient starts late

                // Let's use the logic where masks allow specific regions to show the blur.
                // Actually simplest is:
                // All layers Inset 0.
                // Layer i mask: Linear Gradient from top (transparent) to bottom (opaque).
                // Stops shift.

                const stopStart = (index / layers) * 100
                const stopEnd = ((index + 1) / layers) * 100 + 10 // overlap a bit

                return (
                    <div
                        key={i}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            zIndex: index,
                            backdropFilter: `blur(${blur}px)`,
                            WebkitBackdropFilter: `blur(${blur}px)`,
                            maskImage: `linear-gradient(to bottom, rgba(0,0,0,0) ${stopStart}%, rgba(0,0,0,1) ${stopEnd}%)`,
                            WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0) ${stopStart}%, rgba(0,0,0,1) ${stopEnd}%)`,
                        }}
                    />
                )
            })}
        </motion.div>
    )
}

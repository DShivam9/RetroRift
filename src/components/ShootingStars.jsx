import React, { useEffect, useRef, useState } from 'react'
import './ShootingStars.css'

// Utility function
const cn = (...classes) => classes.filter(Boolean).join(' ')

// Shooting Stars Component
export const ShootingStars = ({
    minSpeed = 10,
    maxSpeed = 30,
    minDelay = 1200,
    maxDelay = 4200,
    starColor = '#9E00FF',
    trailColor = '#2EB9DF',
    starWidth = 10,
    starHeight = 1,
    className,
}) => {
    const [star, setStar] = useState(null)
    const svgRef = useRef(null)

    useEffect(() => {
        const createStar = () => {
            const svgRect = svgRef.current?.getBoundingClientRect()
            if (!svgRect) return

            const startX = Math.random() * svgRect.width
            const startY = Math.random() * (svgRect.height * 0.5) // Top half
            const endX = startX + Math.random() * 600 - 300
            const endY = svgRect.height + 100

            const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed

            setStar({
                id: Date.now(),
                x: startX,
                y: startY,
                endX,
                endY,
                speed,
            })
        }

        const scheduleNext = () => {
            const delay = Math.random() * (maxDelay - minDelay) + minDelay
            return setTimeout(() => {
                createStar()
                scheduleNext()
            }, delay)
        }

        const timeout = scheduleNext()
        return () => clearTimeout(timeout)
    }, [minSpeed, maxSpeed, minDelay, maxDelay])

    return (
        <svg ref={svgRef} className={cn('shooting-stars-svg', className)}>
            {star && (
                <rect
                    key={star.id}
                    x={star.x}
                    y={star.y}
                    width={starWidth}
                    height={starHeight}
                    fill={`url(#gradient-${star.id})`}
                    className="shooting-star-rect"
                    style={{
                        '--start-x': `${star.x}px`,
                        '--start-y': `${star.y}px`,
                        '--end-x': `${star.endX}px`,
                        '--end-y': `${star.endY}px`,
                        '--speed': `${star.speed}`,
                    }}
                />
            )}
            <defs>
                {star && (
                    <linearGradient
                        id={`gradient-${star.id}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
                        <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
                    </linearGradient>
                )}
            </defs>
        </svg>
    )
}

// Stars Background Component
export const StarsBackground = ({
    starDensity = 0.00015,
    allStarsTwinkle = true,
    twinkleProbability = 0.7,
    minTwinkleSpeed = 0.5,
    maxTwinkleSpeed = 1,
    className,
}) => {
    const [stars, setStars] = useState([])
    const canvasRef = useRef(null)

    useEffect(() => {
        const generateStars = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            const area = width * height
            const numStars = Math.floor(area * starDensity)

            const generatedStars = []
            for (let i = 0; i < numStars; i++) {
                generatedStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random(),
                    twinkleSpeed:
                        allStarsTwinkle || Math.random() < twinkleProbability
                            ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
                            : null,
                })
            }
            setStars(generatedStars)
        }

        generateStars()
        window.addEventListener('resize', generateStars)
        return () => window.removeEventListener('resize', generateStars)
    }, [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let animationFrameId

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            stars.forEach((star) => {
                ctx.beginPath()
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${star.twinkleSpeed ? 0.5 + 0.5 * Math.sin(Date.now() * 0.001 * star.twinkleSpeed) : star.opacity})`
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(render)
        }

        render()
        return () => cancelAnimationFrame(animationFrameId)
    }, [stars])

    return <canvas ref={canvasRef} className={cn('stars-background-canvas', className)} />
}

export default ShootingStars

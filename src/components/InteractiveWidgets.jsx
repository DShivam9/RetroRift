import React, { useState, useEffect, useRef } from 'react'
import './InteractiveWidgets.css'

/**
 * AnimatedCounter — Counts up from 0 to target with easing
 */
export function AnimatedCounter({ target, duration = 1500, label, icon, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return (
    <div ref={ref} className="stat-counter">
      <div className="stat-counter__icon">{icon}</div>
      <div className="stat-counter__value">{count}{suffix}</div>
      <div className="stat-counter__label">{label}</div>
    </div>
  )
}

/**
 * RetroTicker — Scrolling news-ticker with retro facts
 */
export function RetroTicker({ items }) {
  return (
    <div className="retro-ticker">
      <div className="retro-ticker__label">
        <span className="retro-ticker__dot" />
        RETRO FACTS
      </div>
      <div className="retro-ticker__track">
        <div className="retro-ticker__content">
          {items.map((item, i) => (
            <span key={i} className="retro-ticker__item">
              {item}
              <span className="retro-ticker__sep">★</span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {items.map((item, i) => (
            <span key={`dup-${i}`} className="retro-ticker__item">
              {item}
              <span className="retro-ticker__sep">★</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * GlitchText — Text that glitches on hover
 */
export function GlitchText({ text, className = '' }) {
  return (
    <span className={`glitch-text ${className}`} data-text={text}>
      {text}
    </span>
  )
}

/**
 * PulseOrb — A softly pulsing ambient orb
 */
export function PulseOrb({ color = '#8b5cf6', size = 120, top, left, right, bottom }) {
  const style = {
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
    top, left, right, bottom,
  }
  return <div className="pulse-orb" style={style} />
}

/**
 * FloatingEmoji — Emoji that floats up and fades
 */
export function FloatingEmojis() {
  const emojis = ['🎮', '👾', '🕹️', '⭐', '🏆', '💎', '🔥', '⚡']
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const now = Date.now()
        const filtered = prev.filter(p => now - p.born < 4000)
        if (filtered.length > 12) return filtered
        return [...filtered, {
          id: now,
          born: now,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x: 10 + Math.random() * 80,
          delay: Math.random() * 0.5,
          size: 14 + Math.random() * 14,
        }]
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="floating-emojis" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="floating-emoji"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            fontSize: p.size,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

/**
 * InteractiveChip — A clickable chip with bounce feedback
 */
export function InteractiveChip({ label, count, active, onClick, color = '#8b5cf6' }) {
  const [bounced, setBounced] = useState(false)

  const handleClick = () => {
    setBounced(true)
    setTimeout(() => setBounced(false), 400)
    onClick?.()
  }

  return (
    <button
      className={`interactive-chip ${active ? 'interactive-chip--active' : ''} ${bounced ? 'interactive-chip--bounce' : ''}`}
      onClick={handleClick}
      style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}33` } : {}}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="interactive-chip__count">{count}</span>
      )}
    </button>
  )
}

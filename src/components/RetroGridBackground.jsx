import React, { useRef, useEffect } from 'react'
import './RetroGridBackground.css'
import NoirRain from './effects/NoirRain'
import TheAbyss from './effects/TheAbyss'
import NeonTokyo from './effects/NeonTokyo'
import AuroraVoid from './effects/AuroraVoid'
import SolarStorm from './effects/SolarStorm'
import MindPalace from './effects/MindPalace'

const FRAMER_THEMES = ['ocean-depth', 'noir-rain', 'neon-tokyo', 'aurora-void', 'solar-storm', 'mind-palace']

export default function RetroGridBackground({ theme = 'matrix', customBgUrl = '', customBgType = 'image' }) {
  const containerRef = useRef(null)

  // CSS-var mouse tracker — powers per-theme cursor glows
  useEffect(() => {
    const el = containerRef.current
    if (!el || FRAMER_THEMES.includes(theme)) return
    const onMove = (e) => {
      el.style.setProperty('--mx', `${((e.clientX / window.innerWidth) * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%`)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [theme])

  return (
    <div ref={containerRef} className={`retro-bg-container retro-theme-${theme}`}>

      {/* ─── 1. Hack the Matrix ─── */}
      {theme === 'matrix' && (
        <div className="bg-engine-digitalrain">
          {[...Array(70)].map((_, i) => (
            <div key={i} className="matrix-stream" style={{
              '--delay': `${Math.random() * -20}s`,
              '--speed': `${1.2 + Math.random() * 3}s`,
              '--x': `${(i / 70) * 100}%`,
              '--h': `${50 + Math.random() * 120}px`,
              '--c': ['#00ff41', '#00cc33', '#00ff41', '#00e63a', '#39ff14', '#00ffcc'][i % 6]
            }} />
          ))}
          <div className="cursor-theme-glow cursor-glow-matrix" />
        </div>
      )}

      {/* ─── 2. Warp Drive ─── */}
      {theme === 'starfield' && (
        <div className="bg-engine-starfield">
          <div className="stars-layer slow"></div>
          <div className="stars-layer med"></div>
          <div className="stars-layer fast"></div>
          <div className="starfield-zoom"></div>
          <div className="cursor-theme-glow cursor-glow-starfield" />
        </div>
      )}

      {/* ─── 3. Cyber Drift ─── */}
      {theme === 'cyberdust' && (
        <div className="bg-engine-cyberdust">
          {[...Array(45)].map((_, i) => (
            <div key={i} className={`dust-particle ${i % 4 === 0 ? 'dust-lg' : ''}`} style={{
              '--x': `${Math.random() * 100}vw`,
              '--y': `${Math.random() * 100}vh`,
              '--scale': `${0.3 + Math.random() * 0.8}`,
              '--dur': `${8 + Math.random() * 16}s`,
              '--del': `${Math.random() * -20}s`,
              '--hue': `${170 + Math.random() * 60}`
            }} />
          ))}
          <div className="cursor-theme-glow cursor-glow-cyberdust" />
        </div>
      )}

      {/* ─── 4. Void & Embers ─── */}
      {theme === 'ember-field' && (
        <div className="bg-engine-ember">
          {[...Array(55)].map((_, i) => (
            <div key={i} className="ember-particle" style={{
              '--x': `${Math.random() * 100}vw`,
              '--drift': `${-50 + Math.random() * 100}px`,
              '--size': `${1.5 + Math.random() * 4}px`,
              '--dur': `${3 + Math.random() * 6}s`,
              '--del': `${Math.random() * -10}s`,
              '--hue': `${8 + Math.random() * 28}`
            }} />
          ))}
          <div className="ember-glow-floor"></div>
          <div className="cursor-theme-glow cursor-glow-ember" />
        </div>
      )}

      {/* ─── 5-10. Framer themes ─── */}
      {theme === 'ocean-depth' && <TheAbyss />}
      {theme === 'noir-rain' && <NoirRain />}
      {theme === 'neon-tokyo' && <NeonTokyo />}
      {theme === 'aurora-void' && <AuroraVoid />}
      {theme === 'solar-storm' && <SolarStorm />}
      {theme === 'mind-palace' && <MindPalace />}

      {/* ─── Custom ─── */}
      {theme === 'custom' && customBgUrl && (
        <div className="bg-engine-custom">
          {customBgType === 'video'
            ? <video src={customBgUrl} autoPlay muted loop playsInline className="custom-bg-media" />
            : <img src={customBgUrl} alt="" className="custom-bg-media" />}
        </div>
      )}

      <div className="retro-vignette" />
    </div>
  )
}

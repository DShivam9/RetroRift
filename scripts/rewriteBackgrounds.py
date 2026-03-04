filepath = 'src/components/RetroGridBackground.jsx'

jsx_content = """import React from 'react'
import './RetroGridBackground.css'

export default function RetroGridBackground({ theme = 'synthwave', particles = 'none' }) {
  return (
    <div className={`retro-bg-container retro-theme-${theme}`}>
      
      {/* 1: Synthwave Grid */}
      {theme === 'synthwave' && (
        <div className="bg-engine-retrowave">
          <div className="wave-sky"></div>
          <div className="wave-ocean-wrapper">
            <div className="wave-ocean"></div>
          </div>
        </div>
      )}

      {/* 2: Matrix Digital Rain */}
      {theme === 'matrix' && (
        <div className="bg-engine-digitalrain">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="matrix-stream" style={{
              '--delay': `${Math.random() * -20}s`,
              '--speed': `${1 + Math.random() * 4}s`,
              '--x': `${(i / 50) * 100}%`,
              '--c': i % 3 === 0 ? '#0ff' : (i % 5 === 0 ? '#f0f' : '#0f0')
            }} />
          ))}
        </div>
      )}

      {/* 3: Deep Space Warp */}
      {theme === 'starfield' && (
        <div className="bg-engine-starfield">
          <div className="stars-layer slow"></div>
          <div className="stars-layer med"></div>
          <div className="stars-layer fast"></div>
        </div>
      )}

      {/* 4: Floating Cyber Dust */}
      {theme === 'cyberdust' && (
        <div className="bg-engine-cyberdust">
          {[...Array(30)].map((_, i) => (
             <div key={i} className="dust-particle" style={{
               '--x': `${Math.random() * 100}vw`,
               '--y': `${Math.random() * 100}vh`,
               '--scale': `${0.2 + Math.random() * 1}`,
               '--dur': `${10 + Math.random() * 20}s`,
               '--del': `${Math.random() * -20}s`
             }} />
          ))}
        </div>
      )}

      {/* 5: Abstract Elegant Waves */}
      {theme === 'abstract-waves' && (
        <div className="bg-engine-abstractwaves">
            <div className="wave-line w1"></div>
            <div className="wave-line w2"></div>
            <div className="wave-line w3"></div>
        </div>
      )}

      {/* 6: Minimal Perspective Grid */}
      {theme === 'minimal-grid' && (
        <div className="bg-engine-minimalgrid">
           <div className="minimal-grid-floor"></div>
        </div>
      )}

      {/* Ambient Particles */}
      {particles === 'snow' && <div className="particles-snow"></div>}

      {/* Global Vignette */}
      <div className="retro-vignette"></div>
    </div>
  )
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(jsx_content)

print('RetroGridBackground.jsx completely rewritten.')

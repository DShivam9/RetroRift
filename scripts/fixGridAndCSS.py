import os

css = """
/* Global container */
.retro-bg-container {
  position: fixed; inset: 0; z-index: -1;
  background-color: #030005; overflow: hidden; perspective: 1000px;
}

/* =========================================
   ENGINE 1: SYNTHWAVE GRID (Outrun) [FIXED]
   ========================================= */
.retro-theme-synthwave {
  background-color: #0b021c;
  --sun-top: #ff0055;
  --sun-bottom: #ffaa00;
  --grid-color: rgba(255, 0, 212, 0.6);
  --grid-glow: rgba(255, 0, 212, 0.3);
}

.retro-theme-synthwave .retro-sun {
  position: absolute; top: 25%; left: 50%; transform: translateX(-50%);
  width: 40vh; height: 40vh; border-radius: 50%;
  background: linear-gradient(180deg, var(--sun-top) 0%, var(--sun-bottom) 100%);
  box-shadow: 0 0 100px var(--sun-top), 0 0 150px var(--sun-bottom); z-index: 2;
  /* Proper retro striped sun */
  mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 60%, transparent 63%, #000 63%, #000 70%, transparent 70%, transparent 74%, #000 74%, #000 82%, transparent 82%, transparent 87%, #000 87%, #000 95%, transparent 95%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 60%, transparent 63%, #000 63%, #000 70%, transparent 70%, transparent 74%, #000 74%, #000 82%, transparent 82%, transparent 87%, #000 87%, #000 95%, transparent 95%);
}

.retro-theme-synthwave .retro-grid-wrapper {
  position: absolute; bottom: 0; left: -50%; right: -50%; height: 50vh;
  transform-style: preserve-3d; transform: rotateX(75deg); transform-origin: top center; z-index: 3;
}

.retro-theme-synthwave .retro-grid {
  position: absolute; top: 0; left: 0; right: 0; bottom: -50vh;
  background-image: 
    linear-gradient(var(--grid-color) 2px, transparent 2px),
    linear-gradient(90deg, var(--grid-color) 2px, transparent 2px);
  background-size: 80px 80px;
  background-position: 0 0;
  /* fixed jumping glitch by changing background-position instead of Y-transform */
  animation: bgMove 1.5s linear infinite;
  /* fade grid into horizon seamlessly */
  mask-image: linear-gradient(to bottom, transparent 0%, #000 40%, #000 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 40%, #000 100%);
}

@keyframes bgMove {
  100% { background-position: 0 80px; }
}

/* =========================================
   ENGINE 2: MATRIX DIGITAL RAIN
   ========================================= */
.retro-theme-matrix { background-color: #000; }
.bg-engine-matrix { position: absolute; inset: 0; width: 100%; height: 100%; }
.matrix-drop {
  position: absolute; top: -50vh; width: 2px; height: 50vh; left: var(--x);
  background: linear-gradient(transparent, #0f0 80%, #fff 100%);
  animation: matrixFall var(--duration) linear var(--delay) infinite;
  opacity: 0.8; box-shadow: 0 0 10px #0f0;
}
@keyframes matrixFall {
  0% { transform: translateY(-100vh); opacity: 1; }
  80% { opacity: 0.5; }
  100% { transform: translateY(200vh); opacity: 0; }
}

/* =========================================
   ENGINE 3: DEEP SPACE WARP
   ========================================= */
.retro-theme-starfield { background-color: #010108; }
.bg-engine-starfield { position: absolute; inset: 0; width: 100%; height: 100%; }
.space-nebula {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 70%, rgba(90, 0, 200, 0.2), transparent 40%),
              radial-gradient(circle at 70% 30%, rgba(0, 200, 255, 0.2), transparent 40%);
  filter: blur(40px);
}
.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
    radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), rgba(0,0,0,0));
  background-repeat: repeat;
}
.stars-layer-1 { background-size: 200px 200px; animation: warp 60s linear infinite; opacity: 0.4; }
.stars-layer-2 { background-size: 300px 300px; animation: warp 40s linear infinite; opacity: 0.6; }
.stars-layer-3 { background-size: 400px 400px; animation: warp 20s linear infinite; opacity: 0.8; }
@keyframes warp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-1000px); }
}

/* =========================================
   ENGINE 4: FLOATING CYBER DUST
   ========================================= */
.retro-theme-cyberdust { background: radial-gradient(circle at center, #1a0b2e 0%, #05010f 100%); }
.bg-engine-cyberdust { position: absolute; inset: 0; overflow: hidden; }
.cyber-mote {
  position: absolute; width: var(--size); height: var(--size);
  background: hsl(var(--hue, 280), 100%, 70%); border-radius: 50%;
  box-shadow: 0 0 10px hsl(var(--hue, 280), 100%, 60%);
  animation: floatDust var(--dr) ease-in-out var(--dl) infinite alternate;
}
@keyframes floatDust {
  0% { transform: translate(var(--x-start), var(--y-start)) scale(0.8); opacity: 0.2; }
  50% { opacity: 0.8; }
  100% { transform: translate(var(--x-end), var(--y-end)) scale(1.2); opacity: 0.2; }
}

/* =========================================
   ENGINE 5: VAPORWAVE SUNSET
   ========================================= */
.retro-theme-vaporwave {
  background: linear-gradient(180deg, #ff71ce 0%, #01cdfe 60%, #050014 100%);
}
.bg-engine-vaporwave {
  position: absolute; inset: 0;
}
.vaporwave-sun {
  position: absolute; bottom: 40%; left: 50%; transform: translateX(-50%);
  width: 50vh; height: 50vh; border-radius: 50%;
  background: linear-gradient(180deg, #fffb96 0%, #ffb56b 100%);
  box-shadow: 0 0 120px rgba(255, 181, 107, 0.8);
}
.vaporwave-grid {
  position: absolute; bottom: 0; left: -50%; right: -50%; height: 40vh;
  transform-style: preserve-3d; transform: rotateX(80deg); transform-origin: top center;
  background-image: 
    linear-gradient(#05ffa1 2px, transparent 2px),
    linear-gradient(90deg, #05ffa1 2px, transparent 2px);
  background-size: 60px 60px;
  animation: bgMove 2s linear infinite;
  mask-image: linear-gradient(to bottom, transparent, #000 30%);
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%);
}

/* =========================================
   ENGINE 6: NEON CITY SKYLINE
   ========================================= */
.retro-theme-neoncity {
  background: linear-gradient(180deg, #060814 0%, #170b2c 100%);
}
.bg-engine-neoncity {
  position: absolute; inset: 0; overflow: hidden;
}
.city-layer-back {
  position: absolute; bottom: 0; width: 200%; height: 40%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200"><path fill="%230f0f2a" d="M0,200 L0,100 L50,100 L50,60 L100,60 L100,120 L150,120 L150,40 L180,40 L180,90 L230,90 L230,20 L280,20 L280,110 L320,110 L320,50 L380,50 L380,130 L450,130 L450,10 L500,10 L500,70 L550,70 L550,30 L620,30 L620,80 L670,80 L670,20 L720,20 L720,90 L780,90 L780,40 L840,40 L840,110 L900,110 L900,50 L950,50 L950,100 L1000,100 L1000,200 Z"/></svg>') repeat-x bottom left;
  background-size: 50% 100%;
  animation: scrollCity 60s linear infinite;
  opacity: 0.6; filter: blur(2px) drop-shadow(0 -10px 20px rgba(139,92,246,0.3));
}
.city-layer-front {
  position: absolute; bottom: 0; width: 200%; height: 30%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200"><path fill="%232e0c50" d="M0,200 L0,140 L40,140 L40,110 L90,110 L90,160 L160,160 L160,80 L210,80 L210,130 L270,130 L270,90 L330,90 L330,150 L400,150 L400,100 L460,100 L460,60 L510,60 L510,140 L570,140 L570,110 L630,110 L630,180 L680,180 L680,70 L740,70 L740,130 L810,130 L810,90 L880,90 L880,150 L930,150 L930,120 L1000,120 L1000,200 Z"/></svg>') repeat-x bottom left;
  background-size: 50% 100%;
  animation: scrollCity 30s linear infinite;
  filter: drop-shadow(0 0 10px rgba(2ec, 72, 153, 0.4));
}
@keyframes scrollCity { 100% { transform: translateX(-50%); } }

/* =========================================
   ENGINE 7: HYPERSPACE TUNNEL
   ========================================= */
.retro-theme-hyperspace { background-color: #000; }
.bg-engine-hyperspace { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.hyper-tunnel {
  width: 200vw; height: 200vw;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(34, 211, 238, 0.5) 10deg, transparent 20deg, rgba(139, 92, 246, 0.5) 30deg, transparent 40deg, rgba(34, 211, 238, 0.5) 50deg, transparent 60deg, rgba(236, 72, 153, 0.5) 80deg, transparent 100deg, rgba(34, 211, 238, 0.8) 120deg, transparent 140deg, rgba(139, 92, 246, 0.5) 160deg, transparent 180deg, rgba(236, 72, 153, 0.5) 200deg, transparent 220deg, rgba(34, 211, 238, 0.5) 240deg, transparent 260deg, rgba(139, 92, 246, 0.8) 280deg, transparent 300deg, rgba(236, 72, 153, 0.5) 320deg, transparent 340deg, rgba(34, 211, 238, 0.5) 360deg);
  animation: hyperSpin 10s linear infinite;
  mask-image: radial-gradient(circle, transparent 10%, #000 60%);
  -webkit-mask-image: radial-gradient(circle, transparent 10%, #000 60%);
}
@keyframes hyperSpin { 100% { transform: rotate(360deg) scale(1.5); } }

/* ─── Global Vignette ─── */
.retro-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.9) 100%);
  z-index: 4; pointer-events: none;
}
"""

with open('src/components/RetroGridBackground.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update RetroGridBackground.jsx to include these new engines
jsx = """import React from 'react'
import './RetroGridBackground.css'

export default function RetroGridBackground({ theme = 'synthwave', particles = 'none' }) {
  
  return (
    <div className={`retro-bg-container retro-theme-${theme}`}>
      
      {theme === 'synthwave' && (
        <>
          <div className="retro-sun"></div>
          <div className="retro-grid-wrapper"><div className="retro-grid"></div></div>
        </>
      )}

      {theme === 'matrix' && (
        <div className="bg-engine-matrix">
           {[...Array(30)].map((_, i) => (
             <div key={i} className="matrix-drop" style={{ '--delay': `${Math.random() * -10}s`, '--duration': `${2 + Math.random() * 3}s`, '--x': `${(i / 30) * 100}%` }} />
           ))}
        </div>
      )}

      {theme === 'starfield' && (
        <div className="bg-engine-starfield">
           <div className="space-nebula"></div>
           <div className="stars-layer-1"></div><div className="stars-layer-2"></div><div className="stars-layer-3"></div>
        </div>
      )}

      {theme === 'cyberdust' && (
        <div className="bg-engine-cyberdust">
           {[...Array(40)].map((_, i) => (
             <div key={i} className="cyber-mote" style={{ '--x-start': `${Math.random() * 100}vw`, '--y-start': `${Math.random() * 100}vh`, '--x-end': `${Math.random() * 100}vw`, '--y-end': `${Math.random() * 100}vh`, '--dr': `${15 + Math.random() * 25}s`, '--dl': `${Math.random() * -30}s`, '--size': `${1 + Math.random() * 5}px`, '--hue': `${280 + Math.random() * 80}` }} />
           ))}
        </div>
      )}

      {theme === 'vaporwave' && (
        <div className="bg-engine-vaporwave">
           <div className="vaporwave-sun"></div>
           <div className="vaporwave-grid"></div>
        </div>
      )}

      {theme === 'neoncity' && (
        <div className="bg-engine-neoncity">
           <div className="city-layer-back"></div>
           <div className="city-layer-front"></div>
        </div>
      )}

      {theme === 'hyperspace' && (
        <div className="bg-engine-hyperspace">
           <div className="hyper-tunnel"></div>
        </div>
      )}

      <div className="retro-vignette"></div>
    </div>
  )
}
"""
with open('src/components/RetroGridBackground.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)

# Appending CSS for Profile Modifiers (Identity, Typo, Hero, Alignment)
css_mods = """
/* === NEW MODIFIERS === */

/* Avatar Shapes */
.avatar-shape-circle { border-radius: 50%; }
.avatar-shape-squircle { border-radius: 25%; }
.avatar-shape-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); border-radius: 0; }

/* Avatar Rings */
.frame-ring-solid { outline: 4px solid var(--pglow, var(--accent)); outline-offset: 4px; }
.frame-ring-dashed { outline: 3px dashed var(--pglow, var(--accent)); outline-offset: 6px; animation: spinDashed 10s linear infinite; }
.frame-ring-neon { box-shadow: 0 0 20px 5px var(--pglow, var(--accent)), inset 0 0 20px var(--pglow, var(--accent)); border: 2px solid #fff; }

@keyframes spinDashed { 100% { outline-offset: 6px; transform: rotate(360deg); } }

/* Title Alignments */
.title-align-left { justify-content: flex-start; text-align: left; }
.title-align-center { justify-content: center; text-align: center; }
.title-align-right { justify-content: flex-end; text-align: right; }

.title-align-center .profile__title-pill, .title-align-center .profile__player-tag { margin-left: auto; margin-right: auto; }
.title-align-right .profile__title-pill, .title-align-right .profile__player-tag { margin-left: auto; }

/* Font Weights & Transforms */
.font-weight-normal { font-weight: 400 !important; }
.font-weight-bold { font-weight: 700 !important; }
.font-weight-black { font-weight: 900 !important; }

.text-trans-uppercase { text-transform: uppercase !important; }
.text-trans-lowercase { text-transform: lowercase !important; }

/* Hero Heights */
.hero-height-compact { height: 200px !important; }
.hero-height-normal { height: 320px !important; }
.hero-height-tall { height: 420px !important; }

/* Hero Radii */
.hero-radius-sharp { border-radius: 0 !important; }
.hero-radius-rounded { border-radius: 16px !important; }
.hero-radius-pill { border-radius: 64px !important; }
.hero-radius-sharp .profile__hero-bg, .hero-radius-rounded .profile__hero-bg, .hero-radius-pill .profile__hero-bg { border-radius: inherit; }
.hero-radius-sharp .profile__hero-overlay, .hero-radius-rounded .profile__hero-overlay, .hero-radius-pill .profile__hero-overlay { border-radius: inherit; }

/* Hero Overlays */
.profile__hero-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.overlay-gradient-up { background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%); }
.overlay-gradient-down { background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%); }
.overlay-radial { background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.7) 100%); }

/* Hero Banner Intensifications (Fix) */
.profile__hero-banner--circuit { opacity: 0.8 !important; }
.profile__hero-banner--waves { opacity: 0.9 !important; }

"""
with open('src/pages/ProfilePage.css', 'a', encoding='utf-8') as f:
    f.write(css_mods)

print("CSS injected successfully!")

filepath = 'src/components/RetroGridBackground.css'

css_content = """/* ═══════════════════════════════════════════════════════════════
   PREMIUM RETRO BACKGROUND ENGINES (Sleek/Minimalist Edition)
   ═══════════════════════════════════════════════════════════════ */

/* ─── BASE CONTAINER ─── */
.retro-bg-container {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 0;
  overflow: hidden;
  background-color: #050510;
  pointer-events: none;
}
.retro-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%);
  pointer-events: none;
  z-index: 10;
}

/* ─── 1. SYNTHWAVE GRID (Retro Wave) ─── */
.bg-engine-retrowave {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #11051F 0%, #2A0845 50%, #000 50%);
}
.wave-sky {
  position: absolute; top: 0; left: 0; right: 0; height: 50vh;
  background: repeating-linear-gradient(0deg, var(--accent) 0px, transparent 1px, transparent 4px);
  opacity: 0.1;
}
.wave-ocean-wrapper {
  position: absolute; top: 50vh; left: 0; right: 0; height: 50vh;
  perspective: 600px;
  overflow: hidden;
}
.wave-ocean {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  transform: rotateX(75deg);
  background-image: 
    linear-gradient(var(--accent) 2px, transparent 2px),
    linear-gradient(90deg, var(--accent) 2px, transparent 2px);
  background-size: 50px 50px;
  background-position: center bottom;
  animation: waveTravel 5s linear infinite;
  box-shadow: inset 0 0 100px var(--accent);
}
@keyframes waveTravel { from { background-position: 0 0; } to { background-position: 0 50px; } }

/* ─── 2. MATRIX DIGITAL RAIN ─── */
.bg-engine-digitalrain { position: absolute; inset: 0; background: #000500; }
.matrix-stream {
  position: absolute; width: 2px; height: 100px;
  background: linear-gradient(180deg, transparent, var(--c), #fff);
  left: var(--x); top: -100px;
  animation: rainDown var(--speed) linear var(--delay) infinite;
  box-shadow: 0 0 10px var(--c);
}
@keyframes rainDown { to { transform: translateY(120vh); } }

/* ─── 3. DEEP SPACE WARP ─── */
.bg-engine-starfield { position: absolute; inset: 0; background: #020108; }
.stars-layer {
  position: absolute; inset: 0;
  background-image: radial-gradient(1px 1px at 20px 30px, #fff, transparent),
                    radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
                    radial-gradient(2px 2px at 50px 160px, rgba(255,255,255,0.6), transparent),
                    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.5), transparent);
  background-size: 200px 200px;
}
.stars-layer.slow { animation: warpStar 40s linear infinite; opacity: 0.5; }
.stars-layer.med { background-size: 300px 300px; animation: warpStar 20s linear infinite; opacity: 0.8; }
.stars-layer.fast { background-size: 400px 400px; animation: warpStar 10s linear infinite; }
@keyframes warpStar { from { transform: translateY(0); } to { transform: translateY(400px); } }

/* ─── 4. FLOATING CYBER DUST ─── */
.bg-engine-cyberdust { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, #0a0a1a 0%, #000 100%); }
.dust-particle {
  position: absolute; width: 4px; height: 4px; background: cyan;
  border-radius: 50%; box-shadow: 0 0 8px cyan, 0 0 15px var(--accent);
  left: var(--x); top: var(--y);
  transform: scale(var(--scale));
  animation: floatDust var(--dur) ease-in-out var(--del) infinite alternate;
}
@keyframes floatDust {
  0% { transform: scale(var(--scale)) translate(0, 0); opacity: 0.1; }
  50% { opacity: 0.8; }
  100% { transform: scale(var(--scale)) translate(30px, -50px); opacity: 0.1; }
}

/* ─── 5. ABSTRACT ELEGANT WAVES ─── */
.bg-engine-abstractwaves {
  position: absolute; inset: 0; background: #050505;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.wave-line {
  position: absolute; width: 120%; height: 2px;
  background: var(--accent); opacity: 0.15;
  box-shadow: 0 0 20px var(--accent);
  animation: sway 8s ease-in-out infinite alternate;
}
.wave-line.w1 { transform: rotate(-5deg) translateY(-100px); animation-delay: 0s; }
.wave-line.w2 { transform: rotate(5deg) translateY(0px); animation-delay: -2s; opacity: 0.3; }
.wave-line.w3 { transform: rotate(-2deg) translateY(100px); animation-delay: -4s; }
@keyframes sway {
  0% { transform: scale(1) translateY(var(--dy, 0)) rotate(var(--deg, -5deg)); }
  100% { transform: scale(1.1) translateY(calc(var(--dy, 0) + 20px)) rotate(calc(var(--deg, -5deg) + 2deg)); }
}

/* ─── 6. MINIMAL PERSPECTIVE GRID ─── */
.bg-engine-minimalgrid {
  position: absolute; inset: 0; background: radial-gradient(circle at top, #111 0%, #000 100%);
  perspective: 800px;
}
.minimal-grid-floor {
  position: absolute; bottom: -20vh; left: -50vw; width: 200vw; height: 60vh;
  transform: rotateX(80deg);
  background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: minimalGridMove 10s linear infinite;
}
@keyframes minimalGridMove {
  from { background-position: 0 0; }
  to { background-position: 0 60px; }
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(css_content)

print('RetroGridBackground.css completely rewritten for sleek performance.')

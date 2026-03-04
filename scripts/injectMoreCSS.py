import os

css = """
/* =========================================
   10 IMmersive HERO BANNERS
   ========================================= */

/* 1. Holo Grid */
.profile__hero-banner--holo-grid {
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  transform: perspective(600px) rotateX(40deg) scale(1.5);
  animation: holoSpin 20s linear infinite; opacity: 0.5 !important;
}
@keyframes holoSpin { 100% { transform: perspective(600px) rotateX(40deg) scale(1.5) rotate(360deg); } }

/* 2. Laser Scan */
.profile__hero-banner--laser-scan {
  background: linear-gradient(0deg, transparent 48%, rgba(255,255,255,0.8) 50%, transparent 52%);
  background-size: 100% 200%; opacity: 0.6 !important;
  animation: scanLaser 3s ease-in-out infinite alternate;
}
@keyframes scanLaser { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }

/* 3. Data Stream */
.profile__hero-banner--data-stream {
  background: repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px);
  background-size: 100% 200%; opacity: 0.4 !important;
  animation: fallData 1s linear infinite;
}
@keyframes fallData { 100% { background-position: 0 100%; } }

/* 4. Glitch Stripe */
.profile__hero-banner--glitch-stripe {
  background: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px);
  animation: snapStripe 0.5s steps(2, end) infinite; opacity: 0.7 !important;
}
@keyframes snapStripe { 0% { background-position: 0px 0; } 100% { background-position: 40px 0; } }

/* 5. Pulse Ring */
.profile__hero-banner--pulse-ring {
  background: radial-gradient(circle, transparent 20%, rgba(255,255,255,0.3) 22%, transparent 24%);
  background-size: 100px 100px; background-position: center;
  animation: ringPulse 2s ease-out infinite; opacity: 0.6 !important;
}
@keyframes ringPulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }

/* 6. Cyber Pulse */
.profile__hero-banner--cyber-pulse {
  background-image: radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px); background-size: 20px 20px;
  animation: flickerPulse 4s infinite alternate; opacity: 0.8 !important;
}
@keyframes flickerPulse { 0% { opacity: 0.2; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }

/* 7. Retro Stars */
.profile__hero-banner--retro-stars {
  background: radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #fff, transparent), radial-gradient(2px 2px at 50px 160px, rgba(255,255,255,0.8), transparent);
  background-size: 100px 100px;
  animation: starWarp 2s linear infinite; opacity: 0.8 !important;
}
@keyframes starWarp { 100% { background-position: -100px 0; } }

/* 8. CRT Noise */
.profile__hero-banner--crt-noise {
  background-image: repeating-radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(0,0,0,0.1) 2px);
  animation: noiseStatic 0.1s steps(3, end) infinite; opacity: 0.5 !important;
}
@keyframes noiseStatic { 0% { transform: translate(0,0); } 100% { transform: translate(5px, 5px); } }

/* 9. Synth Mountains */
.profile__hero-banner--synth-mountains {
  background: 
    linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.4) 50%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.4) 50%, transparent 52%);
  background-size: 60px 60px;
  background-position: bottom;
  animation: mntScroll 5s linear infinite; opacity: 0.7 !important;
}
@keyframes mntScroll { 100% { background-position: -60px 0; } }

/* 10. Neon Wireframe */
.profile__hero-banner--neon-wireframe {
  background-image: linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 2px);
  background-size: 40px 40px; transform: rotate(-10deg) scale(1.5);
  animation: wireHance 10s ease-in-out infinite alternate; opacity: 0.4 !important;
}
@keyframes wireHance { 100% { transform: rotate(10deg) scale(1.5); } }

/* =========================================
   TYPOGRAPHY FONTS & EFFECTS
   ========================================= */

@import url('https://fonts.googleapis.com/css2?family=Monoton&family=Bungee&family=Righteous&family=Silkscreen&display=swap');

.profile[data-font="monoton"] .profile__name { font-family: 'Monoton', cursive; font-size: 2.2rem; }
.profile[data-font="bungee"] .profile__name { font-family: 'Bungee', cursive; font-size: 2rem; }
.profile[data-font="righteous"] .profile__name { font-family: 'Righteous', cursive; font-size: 2.4rem; }
.profile[data-font="silkscreen"] .profile__name { font-family: 'Silkscreen', cursive; font-size: 1.8rem; }

/* 1. Chromatic Split */
.profile__name--chromatic-split { text-shadow: -2px 0 0 red, 2px 0 0 cyan !important; animation: chromoJitter 2s infinite alternate; }
@keyframes chromoJitter { 0% { text-shadow: -2px 0 0 red, 2px 0 0 cyan; } 100% { text-shadow: -4px 0 0 red, 4px 0 0 cyan; } }

/* 2. Neon Flicker */
.profile__name--neon-flicker { animation: signFlicker 4s infinite; }
@keyframes signFlicker { 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; } 20%, 24%, 55% { opacity: 0.3; } }

/* 3. Liquid Fill */
.profile__name--liquid-fill {
  background: linear-gradient(0deg, var(--accent) 0%, transparent 100%);
  background-clip: text; -webkit-background-clip: text; color: transparent !important;
  background-size: 100% 200%; animation: fillUp 3s ease-in-out infinite alternate;
}
@keyframes fillUp { 0% { background-position: 0 100%; } 100% { background-position: 0 0; } }

/* 4. Shimmer Sweep */
.profile__name--shimmer-sweep {
  background: linear-gradient(90deg, #fff 0%, var(--accent) 50%, #fff 100%);
  background-clip: text; -webkit-background-clip: text; color: transparent !important;
  background-size: 200% 100%; animation: shimmer 3s linear infinite;
}
@keyframes shimmer { 100% { background-position: -200% 0; } }

/* =========================================
   IMMERSIVE XP BARS
   ========================================= */

/* 1. Arcade Segment (3D Blocky Fighting Game Bar) */
.profile[data-level-bar="arcade-segment"] .profile__xp-bar {
  background: #111; padding: 4px; border: 2px solid rgba(255,255,255,0.2); border-radius: 4px; height: 28px;
}
.profile[data-level-bar="arcade-segment"] .profile__xp-fill {
  background-image: repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.8) 18px, rgba(0,0,0,0.8) 22px);
  background-color: var(--accent); border-radius: 0; box-shadow: inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.4);
}

/* 2. Laser Beam (Pure Light + Glowing edge) */
.profile[data-level-bar="laser-beam"] .profile__xp-bar {
  background: transparent; height: 8px; border-radius: 4px; box-shadow: inset 0 0 10px rgba(255,255,255,0.1); overflow: visible;
}
.profile[data-level-bar="laser-beam"] .profile__xp-fill {
  background: var(--accent); box-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent); border-radius: 4px; position: relative;
}
.profile[data-level-bar="laser-beam"] .profile__xp-fill::after {
  content: ''; position: absolute; right: -5px; top: -5px; width: 18px; height: 18px; background: #fff; border-radius: 50%; box-shadow: 0 0 20px #fff;
}

/* 3. Liquid Tank (Bubbling tube) */
.profile[data-level-bar="liquid-tank"] .profile__xp-bar {
  background: rgba(0,0,0,0.5); border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); height: 24px; box-shadow: inset 0 5px 10px rgba(0,0,0,0.8);
}
.profile[data-level-bar="liquid-tank"] .profile__xp-fill {
  background: linear-gradient(180deg, var(--accent) 0%, rgba(0,0,0,0.5) 100%);
  border-radius: 20px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); position: relative; overflow: hidden;
}
.profile[data-level-bar="liquid-tank"] .profile__xp-fill::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.4) 2px, transparent 3px); background-size: 15px 15px;
  animation: bubbleUp 2s linear infinite;
}
@keyframes bubbleUp { 100% { background-position: 0 -30px; } }

/* 4. Holo Tech (Transparent Sci-Fi) */
.profile[data-level-bar="holo-tech"] .profile__xp-bar {
  background: transparent; border: 1px solid var(--accent); height: 12px; border-radius: 0; box-shadow: 0 0 10px rgba(var(--accent-rgb, 139, 92, 246), 0.2);
}
.profile[data-level-bar="holo-tech"] .profile__xp-fill {
  background: repeating-linear-gradient(45deg, var(--accent), var(--accent) 10px, transparent 10px, transparent 20px);
  background-size: 28px 28px; animation: holoBarSlide 1s linear infinite; border-radius: 0; opacity: 0.8;
}
@keyframes holoBarSlide { 100% { background-position: 28px 0; } }

/* =========================================
   6 NEW CURSOR STYLES
   ========================================= */
.app-wrapper.cursor-arcade-joystick { cursor: url('/joystick.png'), pointer !important; } /* Fallback, using pointer for now */
.app-wrapper.cursor-neon-arrow { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9z"/></svg>') 5 12, auto; }
.app-wrapper.cursor-pixel-target { cursor: crosshair; } 
.app-wrapper.cursor-cyber-gauntlet { cursor: pointer; } 
.app-wrapper.cursor-retro-mac-hand { cursor: grab; }

"""
with open('src/pages/ProfilePage.css', 'a', encoding='utf-8') as f:
    f.write(css)

print("CSS algorithms injected successfully!")

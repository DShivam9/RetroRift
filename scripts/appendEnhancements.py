import os

css = """
/* ─── TYPOGRAPHY ─── */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Press+Start+2P&family=VT323&display=swap');

.profile[data-font="pixel"] .profile__name { font-family: 'Press Start 2P', 'Courier New', monospace; text-transform: uppercase; font-size: 1.2rem; }
.profile[data-font="arcade"] .profile__name { font-family: 'VT323', 'Courier New', monospace; font-size: 2.8rem; letter-spacing: 2px; }
.profile[data-font="cyber"] .profile__name { font-family: 'Orbitron', sans-serif; font-weight: 800; font-style: italic; letter-spacing: 2px; }

/* ─── HERO BANNERS (Intensified) ─── */
.profile__hero-banner--waves {
  background: 
    repeating-radial-gradient(circle at 50% 120%, transparent, transparent 10px, rgba(var(--accent-rgb, 139, 92, 246), 0.3) 11px, rgba(var(--accent-rgb, 139, 92, 246), 0.3) 20px);
  opacity: 0.6 !important;
  animation: pulseWaves 4s ease-in-out infinite alternate;
}
@keyframes pulseWaves { 0% { transform: scale(1); } 100% { transform: scale(1.05) translateY(-5%); } }

.profile__hero-banner--circuit {
  background-image: radial-gradient(circle, rgba(34, 211, 238, 0.4) 2px, transparent 2px), radial-gradient(circle, rgba(34, 211, 238, 0.4) 2px, transparent 2px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  opacity: 0.5 !important;
  animation: bgScroll 15s linear infinite;
}
@keyframes bgScroll { 100% { background-position: 40px 40px, 60px 60px; } }

/* ─── BENTO BOX READABILITY ─── */
.profile[data-bento="glass"] .profile__stat-card,
.profile[data-bento="glass"] .profile__bento-next-ach {
  background: rgba(10, 10, 16, 0.9); /* Opaque enough for text readability over intense stars/grids */
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
}

.profile[data-bento="flat"] .profile__stat-card,
.profile[data-bento="flat"] .profile__bento-next-ach {
  background: #111; border-radius: 4px; border: 2px solid rgba(255,255,255,0.1);
}

.profile[data-bento="cyber"] .profile__stat-card,
.profile[data-bento="cyber"] .profile__bento-next-ach {
  background: rgba(0,0,0,0.9);
  border: 1px solid var(--stat-color, var(--accent));
  box-shadow: inset 0 0 15px rgba(var(--accent-rgb, 139, 92, 246), 0.1);
  border-radius: 0;
}

/* ─── ADVANCED GLOBAL OVERLAYS ─── */
.global-crt-overlay {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 3px, 3px 100%;
  box-shadow: inset 0 0 100px rgba(0,0,0,0.9);
  animation: crtFlicker 0.15s infinite;
}

.global-scanline-overlay {
  position: fixed; inset: 0; z-index: 9998; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px);
}
"""
with open('src/pages/ProfilePage.css', 'a', encoding='utf-8') as f:
    f.write(css)
print("Enhancements added.")

import re

filepath = 'src/pages/ProfilePage.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

css_additions = """
/* ========================================================================= */
/* SLEEK & MINIMALIST OVERRIDES (Added based on feedback)                    */
/* ========================================================================= */

/* ─── Global Cursors ─── */
.profile.cursor-minimal-dot, .profile.cursor-minimal-dot * { cursor: crosshair !important; }
.profile.cursor-sleek-arrow, .profile.cursor-sleek-arrow * { cursor: default !important; }
.profile.cursor-mac-os-classic, .profile.cursor-mac-os-classic * { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5,2 L19,16 L12,17 L9,22 L5,2 Z" fill="white" stroke="black" stroke-width="1.5"/></svg>'), auto !important; }
.profile.cursor-cyber-pointer, .profile.cursor-cyber-pointer * { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><polygon points="12,0 24,12 12,24 0,12" fill="cyan" opacity="0.8"/></svg>'), auto !important; }

/* ─── Name Effects ─── */
.profile__name--effect-soft-glow {
  text-shadow: 0 0 15px var(--accent);
  transition: text-shadow 0.3s ease;
}
.profile__name--effect-soft-glow:hover {
  text-shadow: 0 0 25px var(--accent), 0 0 45px var(--accent);
}

.profile__name--effect-gradient-shift {
  background: linear-gradient(90deg, #fff, var(--accent), #fff);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  animation: gradientPan 4s ease infinite;
}
@keyframes gradientPan {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

.profile__name--effect-minimal-slide {
  position: relative;
  overflow: hidden;
}
.profile__name--effect-minimal-slide::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: slideShine 3s infinite;
}
@keyframes slideShine {
  0% { left: -100%; }
  100% { left: 200%; }
}

.profile__name--effect-metallic-shine {
  background: linear-gradient(180deg, #fff 0%, #aaa 50%, #444 51%, #111 100%);
  color: transparent;
  -webkit-background-clip: text;
  text-shadow: 0px 2px 4px rgba(0,0,0,0.5);
}

/* ─── Sleek XP Bars ─── */
[data-level-bar="minimal-line"] .profile__xp-bar {
  height: 2px !important;
  background: rgba(255,255,255,0.05) !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
[data-level-bar="minimal-line"] .profile__xp-fill {
  background: var(--accent) !important;
  box-shadow: 0 0 10px var(--accent) !important;
  border-radius: 0 !important;
}

[data-level-bar="glass-tube"] .profile__xp-bar {
  height: 12px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 6px !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
}
[data-level-bar="glass-tube"] .profile__xp-fill {
  border-radius: 4px !important;
  background: linear-gradient(90deg, transparent, var(--accent)) !important;
}

[data-level-bar="gradient-flow"] .profile__xp-bar {
  height: 8px !important;
  border-radius: 4px !important;
  background: #000 !important;
  overflow: hidden;
}
[data-level-bar="gradient-flow"] .profile__xp-fill {
  background: linear-gradient(90deg, #22d3ee, #8b5cf6, #ec4899) !important;
  background-size: 200% 100% !important;
  animation: bgPan 2s linear infinite !important;
}
@keyframes bgPan {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

[data-level-bar="segmented-minimal"] .profile__xp-bar {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
[data-level-bar="segmented-minimal"] .profile__xp-fill {
  background: repeating-linear-gradient(
    90deg,
    var(--accent) 0px,
    var(--accent) 10px,
    transparent 10px,
    transparent 12px
  ) !important;
}

/* ─── Hero Banners ─── */
.profile__banner[data-banner="glass-reflection"] {
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.18);
}
.profile__banner[data-banner="soft-grid"] {
  background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
.profile__banner[data-banner="minimal-glow"] {
  background: transparent;
  box-shadow: inset 0 -50px 50px -50px var(--accent);
}

/* ─── Typography Fonts ─── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@400;600&display=swap');
[data-font="inter"] .profile__name { font-family: 'Inter', sans-serif !important; letter-spacing: -0.02em; }
[data-font="space-grotesk"] .profile__name { font-family: 'Space Grotesk', sans-serif !important; }
[data-font="pixel"] .profile__name { font-family: 'Press Start 2P', system-ui !important; font-size: 0.6em; line-height: 1.5; }
[data-font="arcade"] .profile__name { font-family: 'ArcadeClassic', monospace !important; }
[data-font="cyber"] .profile__name { font-family: 'Orbitron', sans-serif !important; letter-spacing: 2px; }

"""

if "SLEEK & MINIMALIST OVERRIDES" not in content:
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write("\n" + css_additions)
    print("Sleek CSS extensions appended.")
else:
    print("Sleek CSS extensions already exist.")

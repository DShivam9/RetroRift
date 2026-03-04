filepath = 'src/pages/ProfilePage.css'

css_additions = """
/* ═══════════════════════════════════════════════════════════════
   ANIMATED HERO BANNERS
   ═══════════════════════════════════════════════════════════════ */

/* Living Plasma — morphing gradient positions */
.profile__hero-banner--plasma {
  animation: plasmaShift 8s ease-in-out infinite alternate !important;
  will-change: background-position;
  background-size: 200% 200% !important;
}
@keyframes plasmaShift {
  0%   { background-position: 0% 0%; }
  25%  { background-position: 100% 0%; }
  50%  { background-position: 100% 100%; }
  75%  { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
}

/* Holographic Scanline — scrolling scanlines */
.profile__hero-banner--scanline-fade {
  animation: scanlineScroll 4s linear infinite !important;
  will-change: background-position;
}
@keyframes scanlineScroll {
  from { background-position: 0 0; }
  to   { background-position: 0 40px; }
}

/* Diamond Lattice — slow rotation shimmer */
.profile__hero-banner--diamond-mesh {
  animation: diamondShimmer 12s linear infinite !important;
  will-change: background-position;
}
@keyframes diamondShimmer {
  from { background-position: 0 0; }
  to   { background-position: 60px 60px; }
}

/* Spotlight Sweep — rotating conic gradient */
.profile__hero-banner--spotlight {
  animation: spotlightRotate 8s linear infinite !important;
  will-change: transform;
}
@keyframes spotlightRotate {
  from { filter: hue-rotate(0deg); background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.06) 15deg, transparent 30deg, transparent 360deg); }
  to   { filter: hue-rotate(0deg); background: conic-gradient(from 360deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.06) 15deg, transparent 30deg, transparent 360deg); }
}

/* Ember Horizon — flickering warm glow */
.profile__hero-banner--ember-glow {
  animation: emberFlicker 3s ease-in-out infinite alternate !important;
  will-change: opacity;
}
@keyframes emberFlicker {
  0%   { opacity: 0.7; }
  30%  { opacity: 1; }
  60%  { opacity: 0.85; }
  100% { opacity: 1; }
}


/* ═══════════════════════════════════════════════════════════════
   XP BAR STYLES (data-xp-style attribute on .profile wrapper)
   ═══════════════════════════════════════════════════════════════ */

/* Minimal Line — 2px glowing accent line */
[data-xp-style="minimal-line"] .profile__xp-bar {
  height: 2px !important;
  background: rgba(255,255,255,0.05) !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
[data-xp-style="minimal-line"] .profile__xp-fill {
  background: var(--accent) !important;
  box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent) !important;
  border-radius: 0 !important;
}

/* Glass Tube — glassmorphism with inner highlight */
[data-xp-style="glass-tube"] .profile__xp-bar {
  height: 14px !important;
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 7px !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;
}
[data-xp-style="glass-tube"] .profile__xp-fill {
  border-radius: 6px !important;
  background: linear-gradient(180deg, rgba(255,255,255,0.15), var(--accent)) !important;
  box-shadow: 0 0 8px var(--accent) !important;
}

/* Gradient Flow — panning multi-color gradient */
[data-xp-style="gradient-flow"] .profile__xp-bar {
  height: 8px !important;
  border-radius: 4px !important;
  background: rgba(0,0,0,0.3) !important;
}
[data-xp-style="gradient-flow"] .profile__xp-fill {
  background: linear-gradient(90deg, #22d3ee, var(--accent), #ec4899, #22d3ee) !important;
  background-size: 300% 100% !important;
  animation: xpGradientPan 3s linear infinite !important;
  border-radius: 4px !important;
}
@keyframes xpGradientPan {
  0%   { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

/* Segmented — clean blocks with gaps */
[data-xp-style="segmented"] .profile__xp-bar {
  height: 8px !important;
  background: rgba(255,255,255,0.03) !important;
  border: none !important;
  border-radius: 2px !important;
}
[data-xp-style="segmented"] .profile__xp-fill {
  background: repeating-linear-gradient(
    90deg,
    var(--accent) 0px,
    var(--accent) 12px,
    transparent 12px,
    transparent 14px
  ) !important;
  border-radius: 2px !important;
}

/* Neon Rail — double rail with glow between */
[data-xp-style="neon-rail"] .profile__xp-bar {
  height: 6px !important;
  background: transparent !important;
  border-top: 1px solid rgba(255,255,255,0.15) !important;
  border-bottom: 1px solid rgba(255,255,255,0.15) !important;
  border-left: none !important;
  border-right: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
[data-xp-style="neon-rail"] .profile__xp-fill {
  height: 100% !important;
  background: var(--accent) !important;
  box-shadow: 0 0 8px var(--accent), 0 0 16px var(--accent), inset 0 0 4px rgba(255,255,255,0.3) !important;
  border-radius: 0 !important;
}

/* Liquid Fill — wavy top edge using clip-path */
[data-xp-style="liquid-fill"] .profile__xp-bar {
  height: 16px !important;
  background: rgba(255,255,255,0.04) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  border: none !important;
}
[data-xp-style="liquid-fill"] .profile__xp-fill {
  height: 100% !important;
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 60%, white), var(--accent)) !important;
  border-radius: 8px !important;
  animation: liquidWave 2s ease-in-out infinite !important;
  position: relative !important;
}
@keyframes liquidWave {
  0%, 100% { clip-path: polygon(0 20%, 10% 0%, 20% 15%, 30% 5%, 40% 18%, 50% 0%, 60% 12%, 70% 5%, 80% 15%, 90% 3%, 100% 20%, 100% 100%, 0 100%); }
  50%      { clip-path: polygon(0 10%, 10% 18%, 20% 5%, 30% 15%, 40% 0%, 50% 12%, 60% 5%, 70% 18%, 80% 0%, 90% 15%, 100% 10%, 100% 100%, 0 100%); }
}

/* Pixel Blocks — chunky 8-bit style */
[data-xp-style="pixel-blocks"] .profile__xp-bar {
  height: 12px !important;
  background: rgba(255,255,255,0.03) !important;
  border: 2px solid rgba(255,255,255,0.08) !important;
  border-radius: 0 !important;
  image-rendering: pixelated !important;
}
[data-xp-style="pixel-blocks"] .profile__xp-fill {
  background: var(--accent) !important;
  border-radius: 0 !important;
  box-shadow: 
    inset 0 -3px 0 rgba(0,0,0,0.3),
    inset 0 2px 0 rgba(255,255,255,0.2) !important;
  background-image: repeating-linear-gradient(
    90deg, 
    transparent 0px, transparent 8px,
    rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px
  ) !important;
}
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(css_additions)

print('Hero banner animations and XP bar styles appended.')

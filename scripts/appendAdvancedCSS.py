import os

css_chunk = """
/* ═══════════════════════════════════════════
   HERO BANNERS (heroBanner)
   ═══════════════════════════════════════════ */
.profile__hero-banner--none {
  background: transparent;
}
.profile__hero-banner--grid {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  transform: perspective(500px) rotateX(60deg) translateY(-100px) scale(3);
  opacity: 0.15;
  filter: drop-shadow(0 0 10px var(--accent));
}
.profile__hero-banner--waves {
    background: repeating-radial-gradient(
      circle at 50% 120%,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px
    );
    opacity: 0.2;
}
.profile__hero-banner--circuit {
  background-image: radial-gradient(var(--accent) 1px, transparent 1px), radial-gradient(var(--accent) 1px, transparent 1px);
  background-position: 0 0, 20px 20px;
  background-size: 40px 40px;
  opacity: 0.08;
}


/* ═══════════════════════════════════════════
   PLAYER TAGS (playerTag)
   ═══════════════════════════════════════════ */
.profile__player-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  backdrop-filter: blur(5px);
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.profile__player-tag::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg);
  transition: 0.5s;
}

.profile__player-tag:hover {
  transform: translateY(-2px) scale(1.05);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-color: var(--accent);
  box-shadow: 0 5px 20px color-mix(in srgb, var(--accent) 20%, transparent);
}

.profile__player-tag:hover::before {
  left: 200%;
}


/* ═══════════════════════════════════════════
   LEVEL BAR STYLES (levelBarStyle)
   ═══════════════════════════════════════════ */
/* Applies to .profile__xp-bar and .profile__xp-fill */

.profile__xp-bar {
  flex: 1;
  height: 8px; /* Default height */
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin: 0 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.profile__xp-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Minimal */
.profile[data-level-bar="minimal"] .profile__xp-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: visible;
}
.profile[data-level-bar="minimal"] .profile__xp-fill {
  border-radius: 0;
}
.profile[data-level-bar="minimal"] .profile__xp-fill::after {
  content: '';
  position: absolute;
  right: -3px; top: -2px;
  width: 6px; height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent);
}

/* Segmented */
.profile[data-level-bar="segmented"] .profile__xp-bar {
  height: 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 1px;
}
.profile[data-level-bar="segmented"] .profile__xp-fill {
  background-image: repeating-linear-gradient(
    90deg,
    var(--accent) 0px,
    var(--accent) 10px,
    transparent 10px,
    transparent 12px
  );
  border-radius: 1px;
}

/* Neon Glow */
.profile[data-level-bar="neon"] .profile__xp-bar {
  height: 6px;
  border-radius: 6px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.05);
  overflow: visible;
}
.profile[data-level-bar="neon"] .profile__xp-fill {
  background: #fff;
  box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent), 0 0 30px var(--accent);
  border-radius: 6px;
}

/* Gradient / Animated Wave */
.profile[data-level-bar="gradient"] .profile__xp-bar {
  height: 10px;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}
.profile[data-level-bar="gradient"] .profile__xp-fill {
  background: linear-gradient(90deg, var(--accent) 0%, #fff 50%, var(--accent) 100%);
  background-size: 200% 100%;
  animation: levelGradient MoveWave 3s linear infinite;
}
@keyframes MoveWave {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}


/* ═══════════════════════════════════════════
   BENTO BOX OVERVIEW LAYOUT
   ═══════════════════════════════════════════ */
.profile__pane--bento {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding-bottom: 24px;
}

@media (max-width: 768px) {
  .profile__pane--bento {
    grid-template-columns: 1fr;
  }
}

.profile__bento-stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.profile__stat-card {
  position: relative;
  background: rgba(10, 10, 16, 0.5);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.profile__stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--stat-color, var(--accent)), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.profile__stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(10, 10, 16, 0.7);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.15);
}

.profile__stat-card:hover::before {
  opacity: 1;
}

.profile__bento-next-ach {
  background: rgba(10, 10, 16, 0.5);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
}
.profile__bento-next-ach:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.profile__bento-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

"""

with open('src/pages/ProfilePage.css', 'a', encoding='utf-8') as f:
    f.write(css_chunk)

print("Appended specific advanced CSS styles.")

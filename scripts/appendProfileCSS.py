import os

css_chunk = """
/* ═══════════════════════════════════════════
   BACKGROUND THEMES (bgTheme)
   ═══════════════════════════════════════════ */
.profile[data-bg-theme="obsidian"] .profile__bg {
    background: radial-gradient(circle at 50% 100%, #1a1a24 0%, #06060c 60%);
}

.profile[data-bg-theme="midnight"] .profile__bg {
    background: radial-gradient(ellipse at 20% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(6, 95, 70, 0.1) 0%, transparent 50%),
                #020617;
    animation: bgPulse 15s ease-in-out infinite alternate;
}

.profile[data-bg-theme="neon"] .profile__bg {
    background: radial-gradient(ellipse at 30% 30%, rgba(34, 211, 238, 0.1) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 60%),
                #09090b;
    animation: bgPulse 10s ease-in-out infinite alternate;
}

.profile[data-bg-theme="cyberpunk"] .profile__bg {
    background: radial-gradient(circle at 10% 90%, rgba(250, 204, 21, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 90% 10%, rgba(34, 211, 238, 0.08) 0%, transparent 40%),
                repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px),
                #0a0a0a;
}

.profile[data-bg-theme="synthwave"] .profile__bg {
    background: linear-gradient(180deg, #1e1b4b 0%, #31114b 40%, #581c87 70%, #9d174d 100%);
    opacity: 0.8;
}

@keyframes bgPulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
}

/* ═══════════════════════════════════════════
   PROFILE GLOWS (profileGlow)
   ═══════════════════════════════════════════ */
.profile__hero--glow-subtle {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px color-mix(in srgb, var(--accent) 15%, transparent);
}

.profile__hero--glow-neon {
    box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 30%, transparent), 
                0 0 80px color-mix(in srgb, var(--accent) 20%, transparent);
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

.profile__hero--glow-cyber {
    box-shadow: 4px 4px 0px rgba(34, 211, 238, 0.3), -4px -4px 0px rgba(236, 72, 153, 0.3);
    border-radius: 0;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);
}

/* ═══════════════════════════════════════════
   AVATAR VFX (avatarVfx)
   ═══════════════════════════════════════════ */
.profile__avatar-vfx--glitch {
    position: relative;
    animation: vfxGlitch 3s infinite;
}
.profile__avatar-vfx--glitch::before,
.profile__avatar-vfx--glitch::after {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    border-radius: 50%;
    z-index: -1;
    opacity: 0.5;
}
.profile__avatar-vfx--glitch::before {
    left: 2px;
    background-color: rgba(255, 0, 255, 0.3);
    animation: vfxGlitchAnim 2s infinite alternate-reverse;
}
.profile__avatar-vfx--glitch::after {
    left: -2px;
    background-color: rgba(0, 255, 255, 0.3);
    animation: vfxGlitchAnim 3s infinite alternate;
}

@keyframes vfxGlitchAnim {
    0% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 1px); }
    20% { clip-path: inset(80% 0 10% 0); transform: translate(2px, -1px); }
    40% { clip-path: inset(40% 0 40% 0); transform: translate(-2px, 2px); }
    60% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -2px); }
    80% { clip-path: inset(60% 0 20% 0); transform: translate(-1px, 1px); }
    100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
}

.profile__avatar-vfx--hologram {
    position: relative;
}
.profile__avatar-vfx--hologram::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.2) 50%, transparent 100%);
    background-size: 100% 200%;
    animation: vfxHoloScan 2s linear infinite;
    mix-blend-mode: color-dodge;
}
@keyframes vfxHoloScan {
    0% { background-position: 0% -100%; }
    100% { background-position: 0% 200%; }
}

.profile__avatar-vfx--pulse {
    animation: vfxPulse 2s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 10px var(--accent));
}
@keyframes vfxPulse {
    0% { transform: scale(0.95); opacity: 0.9; }
    100% { transform: scale(1.05); opacity: 1; }
}

/* ═══════════════════════════════════════════
   ACCORDION STYLING
   ═══════════════════════════════════════════ */
.profile__pane--accordion {
    gap: 12px;
}

.cust-accordion {
    background: rgba(10, 10, 16, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}
.cust-accordion.open {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(10, 10, 16, 0.7);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.cust-accordion-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
}
.cust-accordion-header:hover {
    background: rgba(255, 255, 255, 0.03);
}

.cust-accordion-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.1rem;
    font-weight: 500;
}
.cust-accordion-title svg {
    color: var(--accent);
}

.cust-accordion-icon {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: rgba(255, 255, 255, 0.4);
}
.cust-accordion.open .cust-accordion-icon {
    transform: rotate(180deg);
    color: #fff;
}

.cust-accordion-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s;
}
.cust-accordion.open .cust-accordion-body {
    max-height: 1200px; /* large enough to fit content */
    padding: 0 24px 24px;
}

.cust-accordion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    align-items: flex-start;
}

.cust-dropdown-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.cust-dropdown-btn {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}
.cust-dropdown-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}
.cust-dropdown-btn.active {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 20%, transparent);
}
"""

with open('src/pages/ProfilePage.css', 'a', encoding='utf-8') as f:
    f.write(css_chunk)

print("Appended CSS successfully.")

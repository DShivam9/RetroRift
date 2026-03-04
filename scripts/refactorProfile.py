import re

with open('src/pages/ProfilePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ChevronDown to lucide-react imports
if 'ChevronDown' not in content:
    content = content.replace('CircleDot, Hexagon, Diamond, Shield, Square, Octagon', 'CircleDot, Hexagon, Diamond, Shield, Square, Octagon, ChevronDown')


# 2. Add new visual config arrays before useCountUp
configs = """const BG_THEMES = [
  { id: 'obsidian', label: 'Obsidian Glow' },
  { id: 'midnight', label: 'Midnight Matrix' },
  { id: 'neon', label: 'Neon City' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'synthwave', label: 'Synthwave' }
]

const PROFILE_GLOWS = [
  { id: 'none', label: 'None' },
  { id: 'subtle', label: 'Subtle' },
  { id: 'neon', label: 'Neon' },
  { id: 'cyber', label: 'Cyber Glitch' },
]

const AVATAR_VFX = [
  { id: 'none', label: 'None' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'hologram', label: 'Hologram' },
  { id: 'pulse', label: 'Pulse' },
]

// ─── Animated counting hook ─── //"""
content = content.replace('// ─── Animated counting hook ─── //', configs)

# 3. Update DEFAULT_CUSTOM
defaults_old = """const DEFAULT_CUSTOM = {
  avatarColor: '#8b5cf6',
  profileFrame: 'none',
  bannerPattern: 'mesh',
  xpBarStyle: 'default',"""
defaults_new = """const DEFAULT_CUSTOM = {
  avatarColor: '#8b5cf6',
  profileFrame: 'none',
  bannerPattern: 'mesh',
  bgTheme: 'obsidian',
  profileGlow: 'none',
  avatarVfx: 'none',
  xpBarStyle: 'default',"""
content = content.replace(defaults_old, defaults_new)

# 4. Add activeAccordion state
states_old = """  const [activeTab, setActiveTab] = useState('overview')
  const [showClearConfirm, setShowClearConfirm] = useState(false)"""
states_new = """  const [activeTab, setActiveTab] = useState('overview')
  const [activeAccordion, setActiveAccordion] = useState('identity')
  const [showClearConfirm, setShowClearConfirm] = useState(false)"""
content = content.replace(states_old, states_new)


# 5. Apply bgTheme
content = content.replace('<div className="profile" style={{ \'--accent\': accent }}>', '<div className="profile" style={{ \'--accent\': accent }} data-bg-theme={custom.bgTheme}>')

# 6. Apply profileGlow
content = content.replace('<header className="profile__hero">', '<header className={`profile__hero profile__hero--glow-${custom.profileGlow}`}>')

# 7. Apply avatarVfx
content = content.replace('<div className="profile__avatar">', '<div className={`profile__avatar profile__avatar-vfx--${custom.avatarVfx}`}>')


# 8. Massive chunk replace: customize tab
customize_old = re.search(r"\{\/\* ══════════════════════════════════════(.*?)CUSTOMIZE TAB —(.*?)Photo(.*?)\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}", content, re.DOTALL)
if customize_old:
    print('Found customize tab block to replace.')

accordion_jsx = """{/* ══════════════════════════════════════
              CUSTOMIZE TAB — ACCORDION LAYOUT
              ══════════════════════════════════════ */}
          {activeTab === 'customize' && (
            <div className="profile__pane profile__pane--accordion">
              
              {/* ACCORDION 1: Identity & Aesthetics */}
              <div className={`cust-accordion ${activeAccordion === 'identity' ? 'open' : ''}`}>
                <button className="cust-accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'identity' ? '' : 'identity')}>
                  <div className="cust-accordion-title"><User size={18} /> <span>Identity & Aesthetics</span></div>
                  <ChevronDown size={18} className="cust-accordion-icon" />
                </button>
                <div className="cust-accordion-body">
                  <div className="cust-accordion-grid">
                    <div className="cust-section">
                      <div className="cust-header"><Camera size={14} /> <h3>Profile Photo</h3></div>
                      <div className="cust-photo-row">
                        <label className="cust-photo-btn cust-photo-btn--upload">
                          <Camera size={14} /> Upload Photo
                          <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                        {profilePhoto && (
                          <button className="cust-photo-btn cust-photo-btn--remove" onClick={removePhoto}>
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Palette size={14} /> <h3>Avatar Theme</h3></div>
                      <div className="cust-swatches">
                        {AVATAR_THEMES.map(t => (
                          <button key={t.id} className={`cust-swatch ${custom.avatarColor === t.color ? 'active' : ''}`} style={{ '--sw-color': t.color }} onClick={() => updateCustom('avatarColor', t.color)} title={t.label}>
                            <span className="cust-swatch__dot" />
                            <span className="cust-swatch__label">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Sparkles size={14} /> <h3>Avatar VFX</h3></div>
                      <div className="cust-dropdown-grid">
                        {AVATAR_VFX.map(v => (
                          <button key={v.id} className={`cust-dropdown-btn ${custom.avatarVfx === v.id ? 'active' : ''}`} onClick={() => updateCustom('avatarVfx', v.id)}>{v.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Frame size={14} /> <h3>Profile Frame</h3></div>
                      <div className="cust-dropdown-grid">
                        {PROFILE_FRAMES.map(f => (
                          <button key={f.id} className={`cust-dropdown-btn ${custom.profileFrame === f.id ? 'active' : ''}`} onClick={() => updateCustom('profileFrame', f.id)}>{f.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Type size={14} /> <h3>Name Effect</h3></div>
                      <div className="cust-dropdown-grid">
                        {NAME_EFFECTS.map(n => (
                          <button key={n.id} className={`cust-dropdown-btn ${custom.nameEffect === n.id ? 'active' : ''}`} onClick={() => updateCustom('nameEffect', n.id)}>{n.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION 2: Layout & Theming */}
              <div className={`cust-accordion ${activeAccordion === 'layout' ? 'open' : ''}`}>
                <button className="cust-accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'layout' ? '' : 'layout')}>
                  <div className="cust-accordion-title"><Layers size={18} /> <span>Layout & Theming</span></div>
                  <ChevronDown size={18} className="cust-accordion-icon" />
                </button>
                <div className="cust-accordion-body">
                  <div className="cust-accordion-grid">
                    <div className="cust-section">
                      <div className="cust-header"><Monitor size={14} /> <h3>Background Theme</h3></div>
                      <div className="cust-dropdown-grid">
                        {BG_THEMES.map(bg => (
                          <button key={bg.id} className={`cust-dropdown-btn ${custom.bgTheme === bg.id ? 'active' : ''}`} onClick={() => updateCustom('bgTheme', bg.id)}>{bg.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Sparkles size={14} /> <h3>Profile Glow</h3></div>
                      <div className="cust-dropdown-grid">
                        {PROFILE_GLOWS.map(g => (
                          <button key={g.id} className={`cust-dropdown-btn ${custom.profileGlow === g.id ? 'active' : ''}`} onClick={() => updateCustom('profileGlow', g.id)}>{g.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Layers size={14} /> <h3>Banner Pattern</h3></div>
                      <div className="cust-dropdown-grid">
                        {BANNER_PATTERNS.map(b => (
                          <button key={b.id} className={`cust-dropdown-btn ${custom.bannerPattern === b.id ? 'active' : ''}`} onClick={() => updateCustom('bannerPattern', b.id)}>{b.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Trophy size={14} /> <h3>Level Badge Shape</h3></div>
                      <div className="cust-dropdown-grid">
                        {BADGE_SHAPES.map(b => (
                          <button key={b.id} className={`cust-dropdown-btn ${custom.badgeShape === b.id ? 'active' : ''}`} onClick={() => updateCustom('badgeShape', b.id)}>{b.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cust-section">
                      <div className="cust-header"><Gauge size={14} /> <h3>XP Bar Style</h3></div>
                      <div className="cust-dropdown-grid">
                        {XP_STYLES.map(s => (
                          <button key={s.id} className={`cust-dropdown-btn ${custom.xpBarStyle === s.id ? 'active' : ''}`} onClick={() => updateCustom('xpBarStyle', s.id)}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION 3: Visual Effects */}
              <div className={`cust-accordion ${activeAccordion === 'vfx' ? 'open' : ''}`}>
                <button className="cust-accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'vfx' ? '' : 'vfx')}>
                  <div className="cust-accordion-title"><Eye size={18} /> <span>Visual Effects</span></div>
                  <ChevronDown size={18} className="cust-accordion-icon" />
                </button>
                <div className="cust-accordion-body">
                  <div className="cust-toggles">
                    {[
                      { key: 'crt', label: 'CRT Simulation', desc: 'Retro phosphor glow', val: crtMode, set: setCrtMode, ext: true },
                      { key: 'scanlines', label: 'Scanlines', desc: 'Horizontal line overlay', val: scanlines, set: setScanlines, ext: true },
                      { key: 'showParticles', label: 'Background Particles', desc: 'Floating ambient particles' },
                      { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Fewer animations' },
                      { key: 'compactStats', label: 'Compact Stats', desc: 'Smaller stat cards' },
                      { key: 'showLevelBadge', label: 'Show Level Badge', desc: 'Badge on avatar' },
                      { key: 'autoAnimate', label: 'Auto-Animate', desc: 'Loop idle animations' },
                      { key: 'darkContrast', label: 'Dark Contrast', desc: 'Higher contrast UI' },
                    ].map(t => (
                      <div key={t.key} className="cust-toggle-row">
                        <div className="cust-toggle-info">
                          <span className="cust-toggle-label">{t.label}</span>
                          <span className="cust-toggle-desc">{t.desc}</span>
                        </div>
                        <ToggleSwitch
                          checked={t.ext ? t.val : custom[t.key]}
                          onChange={(v) => t.ext ? t.set(v) : updateCustom(t.key, v)}
                          color={accent}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACCORDION 4: Audio & Performance */}
              <div className={`cust-accordion ${activeAccordion === 'audio' ? 'open' : ''}`}>
                <button className="cust-accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'audio' ? '' : 'audio')}>
                  <div className="cust-accordion-title"><Music size={18} /> <span>Audio & Performance</span></div>
                  <ChevronDown size={18} className="cust-accordion-icon" />
                </button>
                <div className="cust-accordion-body">
                  <div className="cust-toggles" style={{ marginBottom: '1.5rem' }}>
                    {[
                      { key: 'sfxEnabled', label: 'Sound Effects', desc: 'Button click sounds' },
                      { key: 'hapticFeedback', label: 'Haptic Feedback', desc: 'Vibration on mobile' },
                    ].map(t => (
                      <div key={t.key} className="cust-toggle-row">
                        <div className="cust-toggle-info">
                          <span className="cust-toggle-label">{t.label}</span>
                          <span className="cust-toggle-desc">{t.desc}</span>
                        </div>
                        <ToggleSwitch
                          checked={t.ext ? t.val : custom[t.key]}
                          onChange={(v) => t.ext ? t.set(v) : updateCustom(t.key, v)}
                          color={accent}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="cust-sliders">
                    <RangeSlider label="Music Volume" value={custom.musicVolume} onChange={(v) => updateCustom('musicVolume', v)} unit="%" color={accent} />
                    <RangeSlider label="SFX Volume" value={custom.sfxVolume} onChange={(v) => updateCustom('sfxVolume', v)} unit="%" color="#22d3ee" />
                    <RangeSlider label="Animation Speed" value={custom.animSpeed} onChange={(v) => updateCustom('animSpeed', v)} min={25} max={200} unit="%" color="#22c55e" />
                    <RangeSlider label="Particle Density" value={custom.particleDensity} onChange={(v) => updateCustom('particleDensity', v)} unit="%" color="#f97316" />
                    <RangeSlider label="Background Opacity" value={custom.bgOpacity} onChange={(v) => updateCustom('bgOpacity', v)} unit="%" color="#ec4899" />
                  </div>
                </div>
              </div>

            </div>
          )}"""

content = re.sub(r"\{\/\* ══════════════════════════════════════(.*?)CUSTOMIZE TAB —(.*?)Photo(.*?)\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}", accordion_jsx, content, flags=re.DOTALL)

with open('src/pages/ProfilePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ProfilePage refactored.")

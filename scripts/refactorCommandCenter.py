import re
import os

filepath = 'src/pages/ProfilePage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace("import FloatingOrbs from '../components/FloatingOrbs'", "import RetroGridBackground from '../components/RetroGridBackground'")

if 'MousePointer2' not in content:
    content = content.replace("CircleDot, Hexagon, Diamond, Shield, Square, Octagon, ChevronDown, User", "CircleDot, Hexagon, Diamond, Shield, Square, Octagon, ChevronDown, User, MousePointer2, Sliders, Type as TypeIcon")


# 2. Add missing constant arrays
new_constants = """
const CURSOR_STYLES = [
  { id: 'default', label: 'System Default' },
  { id: 'crosshair', label: 'Sci-Fi Crosshair' },
  { id: 'sword', label: '8-bit Sword' },
  { id: 'hand', label: 'Retro Pointer' }
]

const AMBIENT_PARTICLES = [
  { id: 'none', label: 'None' },
  { id: 'snow', label: 'Digital Snow' },
  { id: 'matrix', label: 'Matrix Rain' },
  { id: 'starfield', label: 'Starfield Warp' }
]

const BENTO_MATERIALS = [
  { id: 'glass', label: 'Glassmorphism' },
  { id: 'flat', label: 'Flat Retro' },
  { id: 'cyber', label: 'Cyber Outline' },
  { id: 'neumorphic', label: 'Neumorphic' }
]

const FONTS = [
  { id: 'default', label: 'System Default' },
  { id: 'pixel', label: '8-bit Pixel' },
  { id: 'arcade', label: 'Arcade Classic' },
  { id: 'cyber', label: 'Cyberpunk' }
]
"""
content = content.replace("const LEVEL_BAR_STYLES =", new_constants + "\nconst LEVEL_BAR_STYLES =")

# 3. Massive DEFAULT_CUSTOM
defs_old = re.search(r"const DEFAULT_CUSTOM = \{.*?\n\}", content, re.DOTALL).group(0)
defs_new = """const DEFAULT_CUSTOM = {
  // 1: Identity
  avatarColor: '#8b5cf6',
  avatarVfx: 'none',
  avatarShape: 'circle',
  profileFrame: 'none',
  frameThickness: 3,

  // 2: Typography
  nameFontFamily: 'default',
  nameEffect: 'none',
  playerTag: 'rising',
  tagColor: '#22d3ee',

  // 3: Hero
  heroBanner: 'none',
  heroBannerTint: '#8b5cf6',
  heroOpacity: 100,
  heroGlowIntensity: 20,
  heroFloatPhysics: false,

  // 4: Environment
  bgTheme: 'synthwave',
  primaryAccent: '#8b5cf6',
  secondaryAccent: '#22d3ee',
  ambientParticles: 'none',
  particleDensity: 50,
  dynamicParallax: false,

  // 5: Progression
  badgeShape: 'circle',
  badgeMaterial: 'flat',
  xpBarStyle: 'default',
  xpFillGradient: 'default',
  xpAnimationStyle: 'smooth',

  // 6: Bento Grid
  bentoMaterial: 'glass',
  bentoHoverPhysics: 'tilt',
  statIconStyle: 'duotone',
  precisePlaytime: false,
  layoutCompactness: 'normal',

  // 7: Audio
  uiHoverSound: 'none',
  uiClickSound: 'none',
  bgmAmbient: 'none',
  musicVolume: 80,
  sfxVolume: 60,
  hapticFeedback: false,

  // 8: Post-Processing
  crtCurve: false,
  scanlines: false,
  chromaticAberration: 0,
  vignette: 0,
  glowBloom: 0,
  colorQuantization: false,

  // 9: Cursor
  cursorStyle: 'default',
  cursorTrail: 'none',
  scrollbarStyle: 'cyberpunk',
  pageTransition: 'fade',

  // 10: Performance
  reducedMotion: false,
  hwAcceleration: true,
  highContrast: false,
  minimalUI: false,
}"""
content = content.replace(defs_old, defs_new)


# 4. Replace background usage
content = content.replace('<FloatingOrbs theme={custom.bgTheme} />', '<RetroGridBackground theme={custom.bgTheme} />')

# 5. Add custom category state
if 'const [customCategory, setCustomCategory]' not in content:
    content = content.replace("const [activeAccordion, setActiveAccordion] = useState('identity')", 
                              "const [activeAccordion, setActiveAccordion] = useState('identity')\n  const [customCategory, setCustomCategory] = useState('identity')")


# 6. Command Center UI Replacement
old_customize_block = re.search(r"\{\/\* ══════════════════════════════════════════════\s*CUSTOMIZE TAB — ACCORDION LAYOUT\s*══════════════════════════════════════════════ \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}", content, re.DOTALL)

if not old_customize_block:
    old_customize_block = re.search(r"\{\/\* ══════════════════════════════════════════════\s*CUSTOMIZE TAB — ACCORDION LAYOUT\s*══════════════════════════════════════════════ \*\/.*?(?:<\/div>\s*){4}\)\}", content, re.DOTALL)
    
if not old_customize_block:
    # Let's use a simpler match just from the start comment to the next generic tab comment
    idx_start = content.find("{/* ══════════════════════════════════════")
    idx_end = content.find("{/* ── SETTINGS ── */}")
    old_customize_block_str = content[idx_start:idx_end]
else:
    old_customize_block_str = old_customize_block.group(0)


new_customize_block = """{/* ══════════════════════════════════════
    COMMAND CENTER CUSTOMIZATION (50+ OPTIONS)
    ══════════════════════════════════════ */}
{activeTab === 'customize' && (
  <div className="profile__pane profile__pane--command">
    
    <div className="command-sidebar">
      {[
        { id: 'identity', icon: User, label: 'Identity & Avatar' },
        { id: 'typo', icon: TypeIcon, label: 'Typography' },
        { id: 'hero', icon: Layers, label: 'Hero Banner' },
        { id: 'env', icon: Monitor, label: 'Environment' },
        { id: 'prog', icon: Trophy, label: 'Progression' },
        { id: 'bento', icon: Grid3X3, label: 'Bento Grid' },
        { id: 'audio', icon: Music, label: 'Audio & Haptics' },
        { id: 'post', icon: Sparkles, label: 'Retro Filters' },
        { id: 'cursor', icon: MousePointer2, label: 'Cursor & Nav' },
        { id: 'perf', icon: Sliders, label: 'Performance' }
      ].map(cat => (
        <button key={cat.id} 
          className={`command-cat-btn ${customCategory === cat.id ? 'active' : ''}`}
          onClick={() => setCustomCategory(cat.id)}>
          <cat.icon size={16} /> <span>{cat.label}</span>
        </button>
      ))}
    </div>

    <div className="command-content scrollbar-custom">
      
      {/* 1. Identity */}
      {customCategory === 'identity' && (
        <div className="command-panel animate-fade-in">
          <h2>Identity & Avatar</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section">
              <div className="cust-header"><Camera size={14} /> <h3>Profile Photo</h3></div>
              <div className="cust-photo-row">
                <label className="cust-photo-btn cust-photo-btn--upload">
                  <Camera size={14} /> Upload
                  <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                </label>
                {profilePhoto && <button className="cust-photo-btn cust-photo-btn--remove" onClick={removePhoto}><Trash2 size={14} /> Remove</button>}
              </div>
            </div>
            <div className="cust-section">
              <div className="cust-header"><Palette size={14} /> <h3>Avatar Theme</h3></div>
              <div className="cust-swatches">
                {AVATAR_THEMES.map(t => (
                  <button key={t.id} className={`cust-swatch ${custom.avatarColor === t.color ? 'active' : ''}`} style={{ '--sw-color': t.color }} onClick={() => updateCustom('avatarColor', t.color)}><span className="cust-swatch__dot" /></button>
                ))}
              </div>
            </div>
            <div className="cust-section"><div className="cust-header"><Sparkles size={14} /> <h3>Avatar VFX</h3></div><CustomDropdown options={AVATAR_VFX} value={custom.avatarVfx} onChange={(v) => updateCustom('avatarVfx', v)} /></div>
            <div className="cust-section"><div className="cust-header"><Frame size={14} /> <h3>Profile Frame</h3></div><CustomDropdown options={PROFILE_FRAMES} value={custom.profileFrame} onChange={(v) => updateCustom('profileFrame', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Frame Thickness</h3></div><RangeSlider value={custom.frameThickness} min={0} max={10} onChange={v => updateCustom('frameThickness', v)} color={accent} unit="px" /></div>
          </div>
        </div>
      )}

      {/* 2. Typography */}
      {customCategory === 'typo' && (
        <div className="command-panel animate-fade-in">
          <h2>Typography & Titles</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><TypeIcon size={14} /> <h3>Font Family</h3></div><CustomDropdown options={FONTS} value={custom.nameFontFamily} onChange={(v) => updateCustom('nameFontFamily', v)} /></div>
            <div className="cust-section"><div className="cust-header"><Sparkles size={14} /> <h3>Name Effect</h3></div><CustomDropdown options={NAME_EFFECTS} value={custom.nameEffect} onChange={(v) => updateCustom('nameEffect', v)} /></div>
            <div className="cust-section"><div className="cust-header"><Award size={14} /> <h3>Player Tag</h3></div><CustomDropdown options={PLAYER_TAGS} value={custom.playerTag} onChange={(v) => updateCustom('playerTag', v)} /></div>
          </div>
        </div>
      )}

      {/* 3. Hero */}
      {customCategory === 'hero' && (
        <div className="command-panel animate-fade-in">
          <h2>Hero Banner</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><Layers size={14} /> <h3>Hero Pattern</h3></div><CustomDropdown options={HERO_BANNERS} value={custom.heroBanner} onChange={(v) => updateCustom('heroBanner', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Glow Intensity</h3></div><RangeSlider value={custom.heroGlowIntensity} min={0} max={100} onChange={v => updateCustom('heroGlowIntensity', v)} color={accent} unit="%" /></div>
            <div className="cust-section"><div className="cust-header"><h3>Float Physics</h3></div><ToggleSwitch checked={custom.heroFloatPhysics} onChange={v => updateCustom('heroFloatPhysics', v)} color={accent} /></div>
          </div>
        </div>
      )}

      {/* 4. Environment */}
      {customCategory === 'env' && (
        <div className="command-panel animate-fade-in">
          <h2>Global Environment</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><Monitor size={14} /> <h3>3D Theme</h3></div><CustomDropdown options={BG_THEMES} value={custom.bgTheme} onChange={(v) => updateCustom('bgTheme', v)} /></div>
            <div className="cust-section"><div className="cust-header"><Sparkles size={14} /> <h3>Ambient Particles</h3></div><CustomDropdown options={AMBIENT_PARTICLES} value={custom.ambientParticles} onChange={(v) => updateCustom('ambientParticles', v)} /></div>
          </div>
        </div>
      )}

      {/* 5. Progression */}
      {customCategory === 'prog' && (
        <div className="command-panel animate-fade-in">
          <h2>Legacy & Progression</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><Gauge size={14} /> <h3>XP Bar Style</h3></div><CustomDropdown options={LEVEL_BAR_STYLES} value={custom.levelBarStyle} onChange={(v) => updateCustom('levelBarStyle', v)} /></div>
            <div className="cust-section"><div className="cust-header"><Palette size={14} /> <h3>XP Skin</h3></div><CustomDropdown options={XP_STYLES} value={custom.xpBarStyle} onChange={(v) => updateCustom('xpBarStyle', v)} /></div>
            <div className="cust-section"><div className="cust-header"><Trophy size={14} /> <h3>Badge Shape</h3></div><CustomDropdown options={BADGE_SHAPES} value={custom.badgeShape} onChange={(v) => updateCustom('badgeShape', v)} /></div>
          </div>
        </div>
      )}

      {/* 6. Bento Grid */}
      {customCategory === 'bento' && (
        <div className="command-panel animate-fade-in">
          <h2>Bento Grid UI</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><Grid3X3 size={14} /> <h3>Material Style</h3></div><CustomDropdown options={BENTO_MATERIALS} value={custom.bentoMaterial} onChange={(v) => updateCustom('bentoMaterial', v)} /></div>
          </div>
        </div>
      )}

      {/* 7. Audio */}
      {customCategory === 'audio' && (
        <div className="command-panel animate-fade-in">
          <h2>Audio & Feedback</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><h3>Volume</h3></div><RangeSlider label="Master Music" value={custom.musicVolume} min={0} max={100} onChange={v => updateCustom('musicVolume', v)} color={accent} unit="%" /></div>
            <div className="cust-section"><div className="cust-header"><h3>SFX</h3></div><RangeSlider label="Master SFX" value={custom.sfxVolume} min={0} max={100} onChange={v => updateCustom('sfxVolume', v)} color="#22d3ee" unit="%" /></div>
          </div>
        </div>
      )}

      {/* 8. Retro Filters */}
      {customCategory === 'post' && (
        <div className="command-panel animate-fade-in">
          <h2>Retro Post-Processing Filters</h2>
          <div className="cust-accordion-grid">
            <div className="cust-toggle-row">
              <div className="cust-toggle-info"><span className="cust-toggle-label">CRT Tube Curvature</span><span className="cust-toggle-desc">Bends edges of the screen</span></div>
              <ToggleSwitch checked={custom.crtCurve} onChange={v => updateCustom('crtCurve', v)} color={accent} />
            </div>
            <div className="cust-toggle-row">
              <div className="cust-toggle-info"><span className="cust-toggle-label">Global Scanlines</span><span className="cust-toggle-desc">Thick retro CRT overlay</span></div>
              <ToggleSwitch checked={custom.scanlines} onChange={v => updateCustom('scanlines', v)} color={accent} />
            </div>
            <div className="cust-section"><div className="cust-header"><h3>Chromatic Aberration</h3></div><RangeSlider value={custom.chromaticAberration} min={0} max={10} onChange={v => updateCustom('chromaticAberration', v)} color="#ec4899" unit="px" /></div>
            <div className="cust-section"><div className="cust-header"><h3>Vignette Shadow</h3></div><RangeSlider value={custom.vignette} min={0} max={100} onChange={v => updateCustom('vignette', v)} color="#000" unit="%" /></div>
            <div className="cust-section"><div className="cust-header"><h3>Radioactive Bloom</h3></div><RangeSlider value={custom.glowBloom} min={0} max={100} onChange={v => updateCustom('glowBloom', v)} color={accent} unit="%" /></div>
          </div>
        </div>
      )}

      {/* 9. Cursor */}
      {customCategory === 'cursor' && (
        <div className="command-panel animate-fade-in">
          <h2>Cursor & Navigation</h2>
          <div className="cust-accordion-grid">
            <div className="cust-section"><div className="cust-header"><MousePointer2 size={14} /> <h3>Cursor Override</h3></div><CustomDropdown options={CURSOR_STYLES} value={custom.cursorStyle} onChange={(v) => updateCustom('cursorStyle', v)} /></div>
          </div>
        </div>
      )}

      {/* 10. Performance */}
      {customCategory === 'perf' && (
        <div className="command-panel animate-fade-in">
          <h2>Performance Engine</h2>
          <div className="cust-accordion-grid">
            <div className="cust-toggle-row">
              <div className="cust-toggle-info"><span className="cust-toggle-label">Hardware Acceleration</span><span className="cust-toggle-desc">Utilizes GPU for graphics</span></div>
              <ToggleSwitch checked={custom.hwAcceleration} onChange={v => updateCustom('hwAcceleration', v)} color="#22c55e" />
            </div>
            <div className="cust-toggle-row">
              <div className="cust-toggle-info"><span className="cust-toggle-label">Reduced Render Motion</span><span className="cust-toggle-desc">Stops parallax and heavy physics</span></div>
              <ToggleSwitch checked={custom.reducedMotion} onChange={v => updateCustom('reducedMotion', v)} color={accent} />
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
)}
"""

content = content.replace(old_customize_block_str, new_customize_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Command Center injected successfully!")

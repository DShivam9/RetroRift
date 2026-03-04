import re

filepath = 'src/pages/ProfilePage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Constants
new_constants = """const AVATAR_SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'squircle', label: 'Squircle' },
  { id: 'hexagon', label: 'Hexagon' }
]
const AVATAR_RINGS = [
  { id: 'none', label: 'None' },
  { id: 'solid', label: 'Solid Border' },
  { id: 'dashed', label: 'Dashed Sci-Fi' },
  { id: 'neon', label: 'Neon Pulse' }
]
const FONT_WEIGHTS = [
  { id: 'normal', label: 'Normal' },
  { id: 'bold', label: 'Bold' },
  { id: 'black', label: 'Heavy/Black' }
]
const TEXT_TRANSFORMS = [
  { id: 'none', label: 'Normal' },
  { id: 'uppercase', label: 'UPPERCASE' },
  { id: 'lowercase', label: 'lowercase' }
]
const TITLE_ALIGNS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' }
]
const HERO_HEIGHTS = [
  { id: 'compact', label: 'Compact' },
  { id: 'normal', label: 'Standard' },
  { id: 'tall', label: 'Expanded' }
]
const HERO_OVERLAYS = [
  { id: 'none', label: 'None' },
  { id: 'gradient-up', label: 'Fade Up' },
  { id: 'gradient-down', label: 'Fade Down' },
  { id: 'radial', label: 'Radial Focus' }
]
const HERO_RADII = [
  { id: 'sharp', label: 'Sharp Edges' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'pill', label: 'Pill Shape' }
]

const BG_THEMES = [
  { id: 'synthwave', label: '3D Outrun Grid' },
  { id: 'matrix', label: 'Matrix Digital Rain' },
  { id: 'starfield', label: 'Deep Space Warp' },
  { id: 'cyberdust', label: 'Floating Cyber Dust' },
  { id: 'vaporwave', label: 'Vaporwave Sunset' },
  { id: 'hyperspace', label: 'Hyperspace Tunnel' },
  { id: 'neoncity', label: 'Neon City Skyline' }
]
"""

# Replace BG_THEMES Array
bg_themes_old = re.search(r"const BG_THEMES = \[\s*\{ id: 'synthwave', label: '3D Outrun Grid' \},.*?\]", content, re.DOTALL)
if bg_themes_old:
    content = content.replace(bg_themes_old.group(0), new_constants)
else:
    print("Warning: BG_THEMES not found")

# 2. Update DEFAULT_CUSTOM
# We will inject these manually into the dictionary string
custom_additions = {
    "avatarShape: 'circle',": "avatarShape: 'circle',\n  avatarRingStyle: 'none',\n  profileGlowColor: '#8b5cf6',",
    "nameEffect: 'none',": "nameEffect: 'none',\n  nameFontWeight: 'bold',\n  nameTransform: 'none',\n  nameGlowIntensity: 10,\n  titleAlignment: 'left',",
    "heroFloatPhysics: false,": "heroFloatPhysics: false,\n  heroHeight: 'normal',\n  heroOverlay: 'gradient-up',\n  heroBorderRadius: 'rounded',\n  heroParticles: 'none',"
}

for old, new in custom_additions.items():
    content = content.replace(old, new)


# 3. Update DOM rendering
# Avatar
avatar_old = r'<div className={`profile__avatar-frame profile__avatar-frame--\${custom.profileFrame}`} style={{ borderColor: accent }}>\s*<div className={`profile__avatar profile__avatar-vfx--\${custom.avatarVfx}`}'
avatar_new = r'<div className={`profile__avatar-frame profile__avatar-frame--${custom.profileFrame} frame-ring-${custom.avatarRingStyle}`} style={{ borderColor: accent, "--pglow": custom.profileGlowColor }}>\n                  <div className={`profile__avatar profile__avatar-vfx--${custom.avatarVfx} avatar-shape-${custom.avatarShape}`}'
content = re.sub(avatar_old, avatar_new, content)

# Typography
name_row_old = r'<div className="profile__name-row">'
name_row_new = r'<div className={`profile__name-row title-align-${custom.titleAlignment}`}>'
content = content.replace(name_row_old, name_row_new)

h1_old = r'<h1 className={`profile__name profile__name--\${custom.nameEffect}`}>\s*<ShinyText text=\{profileName\} speed=\{3\} color="#fff" shineColor=\{accent\} />\s*</h1>'
h1_new = r'<h1 className={`profile__name profile__name--${custom.nameEffect} font-weight-${custom.nameFontWeight} text-trans-${custom.nameTransform}`} style={{ textShadow: `0 0 ${custom.nameGlowIntensity}px var(--accent)` }}>\n                      <ShinyText text={profileName} speed={3} color="#fff" shineColor={accent} />\n                    </h1>'
content = re.sub(h1_old, h1_new, content)

title_pill_old = r'<div className="profile__title-pill">'
title_pill_new = r'<div className={`profile__title-pill title-align-${custom.titleAlignment}`}>'
content = content.replace(title_pill_old, title_pill_new)

# Hero
hero_old = r'<header className={`profile__hero profile__hero--glow-\${custom.profileGlow}`}>\s*<div className={`profile__hero-bg profile__hero-banner--\${custom.heroBanner}`} \s*style=\{\{ opacity: custom.heroOpacity / 100, filter: `drop-shadow\(0 0 \${custom.heroGlowIntensity}px var\(--accent\)\)` \}\}\s*/>'
hero_new = r'<header className={`profile__hero profile__hero--glow-${custom.profileGlow} hero-height-${custom.heroHeight} hero-radius-${custom.heroBorderRadius}`}>\n          <div className={`profile__hero-bg profile__hero-banner--${custom.heroBanner}`} \n               style={{ opacity: custom.heroOpacity / 100, filter: `drop-shadow(0 0 ${custom.heroGlowIntensity}px var(--accent))` }} />\n          <div className={`profile__hero-overlay overlay-${custom.heroOverlay}`} />\n          {custom.heroParticles !== "none" && <div className={`hero-particles-${custom.heroParticles}`} />}'
content = re.sub(hero_old, hero_new, content)


# 4. Inject new controls into command center
# Identity
id_old = r'<div className="cust-section"><div className="cust-header"><Sparkles size=\{14\} /> <h3>Avatar VFX</h3></div><CustomDropdown options=\{AVATAR_VFX\} value=\{custom.avatarVfx\} onChange=\{\(v\) => updateCustom\(\'avatarVfx\', v\)\} /></div>'
id_new = """<div className="cust-section"><div className="cust-header"><Sparkles size={14} /> <h3>Avatar VFX</h3></div><CustomDropdown options={AVATAR_VFX} value={custom.avatarVfx} onChange={(v) => updateCustom('avatarVfx', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Avatar Shape</h3></div><CustomDropdown options={AVATAR_SHAPES} value={custom.avatarShape} onChange={(v) => updateCustom('avatarShape', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Avatar Ring</h3></div><CustomDropdown options={AVATAR_RINGS} value={custom.avatarRingStyle} onChange={(v) => updateCustom('avatarRingStyle', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Profile Glow Color</h3></div><input type="color" value={custom.profileGlowColor} onChange={(e) => updateCustom('profileGlowColor', e.target.value)} style={{width: '100%', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer'}} /></div>"""
content = content.replace(id_old, id_new)

# Typography
typo_old = r'<div className="cust-section"><div className="cust-header"><TypeIcon size=\{14\} /> <h3>Font Family</h3></div><CustomDropdown options=\{FONTS\} value=\{custom.nameFontFamily\} onChange=\{\(v\) => updateCustom\(\'nameFontFamily\', v\)\} /></div>'
typo_new = """<div className="cust-section"><div className="cust-header"><TypeIcon size={14} /> <h3>Font Family</h3></div><CustomDropdown options={FONTS} value={custom.nameFontFamily} onChange={(v) => updateCustom('nameFontFamily', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Font Weight</h3></div><CustomDropdown options={FONT_WEIGHTS} value={custom.nameFontWeight} onChange={(v) => updateCustom('nameFontWeight', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Title Alignment</h3></div><CustomDropdown options={TITLE_ALIGNS} value={custom.titleAlignment} onChange={(v) => updateCustom('titleAlignment', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Text Transform</h3></div><CustomDropdown options={TEXT_TRANSFORMS} value={custom.nameTransform} onChange={(v) => updateCustom('nameTransform', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Name Glow</h3></div><RangeSlider value={custom.nameGlowIntensity} min={0} max={50} onChange={v => updateCustom('nameGlowIntensity', v)} color={accent} unit="px" /></div>"""
content = content.replace(typo_old, typo_new)

# Hero
hero_old2 = r'<div className="cust-section"><div className="cust-header"><Layers size=\{14\} /> <h3>Hero Pattern</h3></div><CustomDropdown options=\{HERO_BANNERS\} value=\{custom.heroBanner\} onChange=\{\(v\) => updateCustom\(\'heroBanner\', v\)\} /></div>'
hero_new2 = """<div className="cust-section"><div className="cust-header"><Layers size={14} /> <h3>Hero Pattern</h3></div><CustomDropdown options={HERO_BANNERS} value={custom.heroBanner} onChange={(v) => updateCustom('heroBanner', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Height</h3></div><CustomDropdown options={HERO_HEIGHTS} value={custom.heroHeight} onChange={(v) => updateCustom('heroHeight', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Overlay Gradient</h3></div><CustomDropdown options={HERO_OVERLAYS} value={custom.heroOverlay} onChange={(v) => updateCustom('heroOverlay', v)} /></div>
            <div className="cust-section"><div className="cust-header"><h3>Border Radius</h3></div><CustomDropdown options={HERO_RADII} value={custom.heroBorderRadius} onChange={(v) => updateCustom('heroBorderRadius', v)} /></div>"""
content = content.replace(hero_old2, hero_new2)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Inject success!")

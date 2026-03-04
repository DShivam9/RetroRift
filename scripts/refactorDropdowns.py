import re

with open('src/pages/ProfilePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'FloatingOrbs' not in content:
    content = content.replace("import GameCard from '../components/GameCard'", "import GameCard from '../components/GameCard'\nimport FloatingOrbs from '../components/FloatingOrbs'\nimport CustomDropdown from '../components/CustomDropdown'")

# 2. Add new constants
new_configs = """const LEVEL_BAR_STYLES = [
  { id: 'minimal', label: 'Minimal Pulse' },
  { id: 'segmented', label: 'Cyber Segments' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'gradient', label: 'Animated Wave' }
]

const PLAYER_TAGS = [
  { id: 'none', label: 'No Title' },
  { id: 'rising', label: '🌟 Rising' },
  { id: 'veteran', label: '🔥 Veteran' },
  { id: 'pro', label: '⚡ Pro Gamer' },
  { id: 'completionist', label: '🏆 Completionist' },
  { id: 'arcade', label: '👾 Arcade Junky' }
]

const HERO_BANNERS = [
  { id: 'none', label: 'None' },
  { id: 'grid', label: 'Perspective Grid' },
  { id: 'waves', label: 'Vapor Waves' },
  { id: 'circuit', label: 'Cyber Circuit' }
]

const BG_THEMES = ["""
content = content.replace("const BG_THEMES = [", new_configs)

# 3. Update defaults
defs_old = """const DEFAULT_CUSTOM = {
  avatarColor: '#8b5cf6',
  profileFrame: 'none',
  bannerPattern: 'mesh',
  bgTheme: 'obsidian',
  profileGlow: 'none',
  avatarVfx: 'none',
  xpBarStyle: 'default',"""

defs_new = """const DEFAULT_CUSTOM = {
  avatarColor: '#8b5cf6',
  profileFrame: 'none',
  bannerPattern: 'mesh',
  bgTheme: 'obsidian',
  profileGlow: 'none',
  avatarVfx: 'none',
  levelBarStyle: 'gradient',
  playerTag: 'rising',
  heroBanner: 'none',
  xpBarStyle: 'default',"""
content = content.replace(defs_old, defs_new)

# 4. Replace empty profile__bg with FloatingOrbs
content = content.replace('<div className="profile__bg" />', '<FloatingOrbs theme={custom.bgTheme} />')

# 5. Fix Hero Banner rendering to new heroBanner prop
hero_old = """<div className="profile__hero-bg" style={{ background: BANNER_PATTERNS.find(b => b.id === custom.bannerPattern)?.bg, backgroundSize: custom.bannerPattern === 'grid' || custom.bannerPattern === 'circuit' ? '30px 30px' : undefined }} />"""
hero_new = """<div className={`profile__hero-bg profile__hero-banner--${custom.heroBanner}`} />"""
content = content.replace(hero_old, hero_new)

# 6. Insert Hover Tag + Edit Username button styling update
name_old = """                  <h2 className="profile__name-text">
                    <ShinyText text={user.displayName || 'Player'} disabled={custom.nameEffect !== 'glow'} speed={3} />
                  </h2>
                  <button className="profile__edit-btn" onClick={() => setEditingName(true)}><Edit3 size={14} /></button>
                </>
              )}
            </div>
            
            <div className="profile__level-badge">"""
name_new = """                  <h2 className={`profile__name-text profile__name-effect--${custom.nameEffect}`}>
                    {user.displayName || 'Player'}
                  </h2>
                  <button className="profile__edit-btn" onClick={() => setEditingName(true)}><Edit3 size={14} /></button>
                </>
              )}
            </div>
            {custom.playerTag !== 'none' && (
              <div className="profile__player-tag">
                {PLAYER_TAGS.find(t => t.id === custom.playerTag)?.label}
              </div>
            )}
            
            <div className="profile__level-badge">"""
content = content.replace(name_old, name_new)


# 7. Customize Tab replacement: change `<div className="cust-dropdown-grid">` + buttons to `<CustomDropdown />`

import re
def replace_dropdown(match):
    header = match.group(1)
    mapping = match.group(2)
    var_name = mapping.split('.map')[0]
    prop = match.group(3).split("updateCustom('")[1].split("'")[0]
    
    return f'<div className="cust-section"><div className="cust-header">{header}</div><CustomDropdown options={{{var_name}}} value={{custom.{prop}}} onChange={{(v) => updateCustom(\'{prop}\', v)}} /></div>'

content = re.sub(
    r'<div className="cust-section">\s*<div className="cust-header">(.*?)<\/div>\s*<div className="cust-dropdown-grid">\s*\{(.*?\.map)\(.*?updateCustom\(\'(.*?)\'.*?<\/button>\s*\)\)\}\s*<\/div>\s*<\/div>',
    replace_dropdown,
    content,
    flags=re.DOTALL
)

# 8. Add levelBarStyle, heroBanner, playerTag to the Layout Accordion
layout_additions = """<div className="cust-section"><div className="cust-header"><Layers size={14} /> <h3>Hero Banner</h3></div><CustomDropdown options={HERO_BANNERS} value={custom.heroBanner} onChange={(v) => updateCustom('heroBanner', v)} /></div>
                    <div className="cust-section"><div className="cust-header"><Type size={14} /> <h3>Player Tag</h3></div><CustomDropdown options={PLAYER_TAGS} value={custom.playerTag} onChange={(v) => updateCustom('playerTag', v)} /></div>
                    <div className="cust-section"><div className="cust-header"><Gauge size={14} /> <h3>Level Bar Style</h3></div><CustomDropdown options={LEVEL_BAR_STYLES} value={custom.levelBarStyle} onChange={(v) => updateCustom('levelBarStyle', v)} /></div>"""

content = content.replace("                    <div className=\"cust-section\"><div className=\"cust-header\"><Trophy size={14} /> <h3>Level Badge Shape</h3></div><CustomDropdown options={BADGE_SHAPES} value={custom.badgeShape} onChange={(v) => updateCustom('badgeShape', v)} /></div>", f"                    <div className=\"cust-section\"><div className=\"cust-header\"><Trophy size={14} /> <h3>Level Badge Shape</h3></div><CustomDropdown options={{BADGE_SHAPES}} value={{custom.badgeShape}} onChange={{(v) => updateCustom('badgeShape', v)}} /></div>\n{layout_additions}")


with open('src/pages/ProfilePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

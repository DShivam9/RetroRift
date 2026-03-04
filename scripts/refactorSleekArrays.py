import re

filepath = 'src/pages/ProfilePage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Provide the new arrays
new_arrays = """const BG_THEMES = [
  { id: 'synthwave', label: '3D Outrun Grid' },
  { id: 'matrix', label: 'Matrix Digital Rain' },
  { id: 'starfield', label: 'Deep Space Warp' },
  { id: 'cyberdust', label: 'Floating Cyber Dust' },
  { id: 'abstract-waves', label: 'Abstract Elegant Waves' },
  { id: 'minimal-grid', label: 'Minimal Perspective Grid' }
]

const HERO_BANNERS = [
  { id: 'none', label: 'Solid Color' },
  { id: 'retro-stars', label: 'Warp Speed Stars' },
  { id: 'synth-mountains', label: 'Wireframe Mountains' },
  { id: 'circuit', label: 'Neon Circuit' },
  { id: 'mesh', label: 'Gradient Mesh' },
  { id: 'aurora', label: 'Aurora Fade' },
  { id: 'glass-reflection', label: 'Glass Reflection' },
  { id: 'soft-grid', label: 'Soft Minimal Grid' },
  { id: 'minimal-glow', label: 'Minimal Edge Glow' }
]

const FONTS = [
  { id: 'default', label: 'System Default' },
  { id: 'pixel', label: 'Retro Pixel' },
  { id: 'arcade', label: 'Arcade Classic' },
  { id: 'cyber', label: 'Cyberpunk' },
  { id: 'inter', label: 'Clean Inter' },
  { id: 'space-grotesk', label: 'Space Grotesk' }
]

const NAME_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'soft-glow', label: 'Soft Ambient Glow' },
  { id: 'gradient-shift', label: 'Smooth Gradient Shift' },
  { id: 'minimal-slide', label: 'Minimal Slide' },
  { id: 'metallic-shine', label: 'Metallic Shine' }
]

const XP_STYLES = [
  { id: 'default', label: 'Default Solid' },
  { id: 'minimal-line', label: 'Minimal Glowing Line' },
  { id: 'glass-tube', label: 'Pristine Glass Tube' },
  { id: 'gradient-flow', label: 'Smooth Gradient Flow' },
  { id: 'segmented-minimal', label: 'Clean Segments' }
]

const CURSOR_STYLES = [
  { id: 'default', label: 'System Default' },
  { id: 'minimal-dot', label: 'Minimal Dot' },
  { id: 'sleek-arrow', label: 'Sleek Arrow' },
  { id: 'mac-os-classic', label: 'Mac OS Classic' },
  { id: 'cyber-pointer', label: 'Cyber Pointer' }
]"""

# Remove old arrays
content = re.sub(r"const BG_THEMES = \[\s*\{ id: 'arcade-carpet'.*?\]", "", content, flags=re.DOTALL)
content = re.sub(r"const HERO_BANNERS = \[\s*\{ id: 'holo-grid'.*?\]", "", content, flags=re.DOTALL)
content = re.sub(r"const FONTS = \[\s*\{ id: 'default'.*?\]", "", content, flags=re.DOTALL)
content = re.sub(r"const NAME_EFFECTS = \[\s*\{ id: 'none'.*?\]", "", content, flags=re.DOTALL)
content = re.sub(r"const XP_STYLES = \[\s*\{ id: 'default'.*?\]", "", content, flags=re.DOTALL)
content = re.sub(r"const CURSOR_STYLES = \[\s*\{ id: 'default'.*?\]", "", content, flags=re.DOTALL)

# Insert the new ones before PLAYER_TAGS
insertion_point = r"const PLAYER_TAGS ="
content = content.replace(insertion_point, new_arrays + "\n\n" + insertion_point)

# 2. Update COMMAND_CATEGORIES to remove Bento and Filters
cats_old = r"const COMMAND_CATEGORIES = \[\s*\{ id: 'identity'.*?\]"
cats_new = """const COMMAND_CATEGORIES = [
  { id: 'identity', label: 'Identity & Avatar', icon: Sparkles },
  { id: 'typography', label: 'Typography', icon: TypeIcon },
  { id: 'hero', label: 'Hero Banner', icon: Frame },
  { id: 'environment', label: 'Environment', icon: Monitor },
  { id: 'progression', label: 'Progression', icon: Trophy },
  { id: 'audio', label: 'Audio & Haptics', icon: Volume2 },
  { id: 'cursor', label: 'Cursor & Navigation', icon: MousePointer2 },
  { id: 'performance', label: 'Performance', icon: Zap }
]"""
content = re.sub(cats_old, cats_new, content, flags=re.DOTALL)

# 3. Add sfxVolume to DEFAULT_CUSTOM
if "sfxVolume" not in content:
    content = content.replace("musicVolume: 50,", "musicVolume: 50,\n  sfxVolume: 20,")

# 4. Remove UI sections for Bento and Filters
bento_ui = r'\{customCategory === \'bento\' && \(.*?\)\}'
filters_ui = r'\{customCategory === \'filters\' && \(.*?\)\}'
content = re.sub(bento_ui, "", content, flags=re.DOTALL)
content = re.sub(filters_ui, "", content, flags=re.DOTALL)
content = content.replace("cursorStyle: 'neon-arrow'", "cursorStyle: 'default'")
content = content.replace("bgTheme: 'arcade-carpet'", "bgTheme: 'synthwave'")
content = content.replace("heroBanner: 'holo-grid'", "heroBanner: 'mesh'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sleek Array Replacements complete.")

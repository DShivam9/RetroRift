import re

filepath = 'src/pages/ProfilePage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
if 'useRef, useEffect, useMemo' not in content:
    content = content.replace("useState, useEffect, useMemo", "useState, useEffect, useMemo, useRef")
if 'useCallback' not in content:
    content = content.replace("useMemo, useRef", "useMemo, useRef, useCallback")

# 2. Inject Massive Arrays
arrays_old = re.search(r"const BG_THEMES = \[\s*\{ id: 'synthwave',.*?const HERO_RADII = \[\s*\{ id: 'sharp',.*?\]", content, re.DOTALL)

arrays_new = """const BG_THEMES = [
  { id: 'arcade-carpet', label: '90s Arcade Floor' },
  { id: 'cyber-circuit', label: 'Neon Circuit Board' },
  { id: 'retro-wave', label: 'Synth Grid Ocean' },
  { id: 'neon-hex', label: 'Breathing Hexagons' },
  { id: 'crt-glitch', label: 'Intense CRT Glitch' },
  { id: 'pixel-clouds', label: '8-Bit Scrolling Sky' },
  { id: 'laser-grid', label: 'Scanning Laser Room' },
  { id: 'synth-sun', label: 'Colossal Wireframe Sun' },
  { id: 'digital-rain', label: 'Matrix Data Stream' },
  { id: 'void-pulse', label: 'Deep Purple Void' }
]

const HERO_BANNERS = [
  { id: 'holo-grid', label: 'Holographic Grid Spin' },
  { id: 'laser-scan', label: 'Vertical Laser Scan' },
  { id: 'data-stream', label: 'Matrix Binary Fall' },
  { id: 'glitch-stripe', label: 'Snapping Color Glitch' },
  { id: 'pulse-ring', label: 'Expanding Neon Rings' },
  { id: 'cyber-pulse', label: 'Hexagon Pulse Array' },
  { id: 'retro-stars', label: 'Warp Speed Stars' },
  { id: 'crt-noise', label: 'Fuzzy TV Static' },
  { id: 'synth-mountains', label: 'Wireframe Mountains' },
  { id: 'neon-wireframe', label: 'Spinning 3D Cubes' }
]

const FONTS = [
  { id: 'default', label: 'System Default' },
  { id: 'monoton', label: '5-Line Monoton' },
  { id: 'bungee', label: 'Blocky Bungee' },
  { id: 'righteous', label: 'Smooth Righteous' },
  { id: 'silkscreen', label: 'Pixel Silkscreen' }
]

const NAME_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'chromatic-split', label: 'Chromatic Split' },
  { id: 'neon-flicker', label: 'Neon Sign Flicker' },
  { id: 'liquid-fill', label: 'Rising Liquid Fill' },
  { id: 'shimmer-sweep', label: 'Glossy Shimmer Sweep' }
]

const XP_STYLES = [
  { id: 'default', label: 'Default Solid' },
  { id: 'arcade-segment', label: '3D Arcade Segments' },
  { id: 'laser-beam', label: 'Pure Laser Beam' },
  { id: 'liquid-tank', label: 'Bubbling Glass Tube' },
  { id: 'holo-tech', label: 'Holographic Sci-Fi UI' }
]

const CURSOR_STYLES = [
  { id: 'default', label: 'System Default' },
  { id: 'crosshair', label: 'Sci-Fi Crosshair' },
  { id: 'sword', label: '8-bit Sword' },
  { id: 'hand', label: 'Retro Pointer' },
  { id: 'arcade-joystick', label: 'Arcade Joystick' },
  { id: 'pixel-target', label: 'Pixel Target' },
  { id: 'neon-arrow', label: 'Neon Arrow' },
  { id: 'cyber-gauntlet', label: 'Cyber Gauntlet' },
  { id: 'retro-mac-hand', label: 'Classic Mac Hand' }
]

const HERO_RADII = [
  { id: 'sharp', label: 'Sharp Edges' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'pill', label: 'Pill Shape' }
]"""

if arrays_old:
    content = content.replace(arrays_old.group(0), arrays_new)
else:
    # Manual targeted replacements if regex fails
    # Replace BGs
    bg_old = re.search(r"const BG_THEMES = \[\s*\{ id: 'synthwave'.*?\]", content, re.DOTALL)
    if bg_old: content = content.replace(bg_old.group(0), "const BG_THEMES = [\n  { id: 'arcade-carpet', label: '90s Arcade Floor' },\n  { id: 'cyber-circuit', label: 'Neon Circuit Board' },\n  { id: 'retro-wave', label: 'Synth Grid Ocean' },\n  { id: 'neon-hex', label: 'Breathing Hexagons' },\n  { id: 'crt-glitch', label: 'Intense CRT Glitch' },\n  { id: 'pixel-clouds', label: '8-Bit Scrolling Sky' },\n  { id: 'laser-grid', label: 'Scanning Laser Room' },\n  { id: 'synth-sun', label: 'Colossal Wireframe Sun' },\n  { id: 'digital-rain', label: 'Matrix Data Stream' },\n  { id: 'void-pulse', label: 'Deep Purple Void' }\n]")
    # Replace Banners
    ban_old = re.search(r"const HERO_BANNERS = \[\s*\{ id: 'none'.*?\]", content, re.DOTALL)
    if ban_old: content = content.replace(ban_old.group(0), "const HERO_BANNERS = [\n  { id: 'holo-grid', label: 'Holographic Grid Spin' },\n  { id: 'laser-scan', label: 'Vertical Laser Scan' },\n  { id: 'data-stream', label: 'Matrix Binary Fall' },\n  { id: 'glitch-stripe', label: 'Snapping Color Glitch' },\n  { id: 'pulse-ring', label: 'Expanding Neon Rings' },\n  { id: 'cyber-pulse', label: 'Hexagon Pulse Array' },\n  { id: 'retro-stars', label: 'Warp Speed Stars' },\n  { id: 'crt-noise', label: 'Fuzzy TV Static' },\n  { id: 'synth-mountains', label: 'Wireframe Mountains' },\n  { id: 'neon-wireframe', label: 'Spinning 3D Cubes' }\n]")
    # Replace Fonts
    f_old = re.search(r"const FONTS = \[\s*\{ id: 'default'.*?\]", content, re.DOTALL)
    if f_old: content = content.replace(f_old.group(0), "const FONTS = [\n  { id: 'default', label: 'System Default' },\n  { id: 'monoton', label: '5-Line Monoton' },\n  { id: 'bungee', label: 'Blocky Bungee' },\n  { id: 'righteous', label: 'Smooth Righteous' },\n  { id: 'silkscreen', label: 'Pixel Silkscreen' }\n]")
    # Replace FX
    fx_old = re.search(r"const NAME_EFFECTS = \[\s*\{ id: 'none'.*?\]", content, re.DOTALL)
    if fx_old: content = content.replace(fx_old.group(0), "const NAME_EFFECTS = [\n  { id: 'none', label: 'None' },\n  { id: 'chromatic-split', label: 'Chromatic Split' },\n  { id: 'neon-flicker', label: 'Neon Sign Flicker' },\n  { id: 'liquid-fill', label: 'Rising Liquid Fill' },\n  { id: 'shimmer-sweep', label: 'Glossy Shimmer Sweep' }\n]")
    # Replace Cursors
    c_old = re.search(r"const CURSOR_STYLES = \[\s*\{ id: 'default'.*?\]", content, re.DOTALL)
    if c_old: content = content.replace(c_old.group(0), "const CURSOR_STYLES = [\n  { id: 'default', label: 'System Default' },\n  { id: 'crosshair', label: 'Sci-Fi Crosshair' },\n  { id: 'sword', label: '8-bit Sword' },\n  { id: 'hand', label: 'Retro Pointer' },\n  { id: 'arcade-joystick', label: 'Arcade Joystick' },\n  { id: 'pixel-target', label: 'Pixel Target' },\n  { id: 'neon-arrow', label: 'Neon Arrow' },\n  { id: 'cyber-gauntlet', label: 'Cyber Gauntlet' },\n  { id: 'retro-mac-hand', label: 'Classic Mac Hand' }\n]")
    # Replace XP Styles
    xp_old = re.search(r"const XP_STYLES = \[\s*\{ id: 'default'.*?\]", content, re.DOTALL)
    if xp_old: content = content.replace(xp_old.group(0), "const XP_STYLES = [\n  { id: 'default', label: 'Default Solid' },\n  { id: 'arcade-segment', label: '3D Arcade Segments' },\n  { id: 'laser-beam', label: 'Pure Laser Beam' },\n  { id: 'liquid-tank', label: 'Bubbling Glass Tube' },\n  { id: 'holo-tech', label: 'Holographic Sci-Fi UI' }\n]")

# Update default values
content = content.replace("bgTheme: 'synthwave',", "bgTheme: 'arcade-carpet',")
content = content.replace("heroBanner: 'none',", "heroBanner: 'holo-grid',")
content = content.replace("cursorStyle: 'default',", "cursorStyle: 'neon-arrow',")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Arrays injected successfully!")

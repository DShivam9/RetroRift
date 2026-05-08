import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, User, Type, Monitor, Sliders, Trophy, 
  Check, Camera, Trash2, Upload, Volume2, Music, 
  Gamepad2, Sparkles, Layout, Gauge, MousePointer2,
  ChevronRight, Image as ImageIcon,
  Pipette, RefreshCcw
} from 'lucide-react'
import RangeSlider from '../RangeSlider'
import ToggleSwitch from '../ToggleSwitch'
import { XPBar } from '../AnimatedIcons'

// ——— HSL Helpers ——— //
const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const HSLColorPicker = ({ color, onChange }) => {
  const { h, s, l } = React.useMemo(() => hexToHsl(color), [color]);

  const updateColor = (key, val) => {
    const newHsl = { h, s, l, [key]: val };
    onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
  };

  return (
    <div className="hsl-picker-container">
      <div className="hsl-preview" style={{ background: color }}>
        <Pipette size={16} />
      </div>
      <div className="hsl-controls">
        <div className="hsl-row">
          <span>H</span>
          <input 
            type="range" min="0" max="360" value={h} 
            onChange={(e) => updateColor('h', parseInt(e.target.value))}
            style={{ background: `linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)` }}
          />
          <span className="val">{h}°</span>
        </div>
        <div className="hsl-row">
          <span>S</span>
          <input 
            type="range" min="0" max="100" value={s} 
            onChange={(e) => updateColor('s', parseInt(e.target.value))}
            style={{ background: `linear-gradient(to right, #888, ${hslToHex(h, 100, 50)})` }}
          />
          <span className="val">{s}%</span>
        </div>
        <div className="hsl-row">
          <span>L</span>
          <input 
            type="range" min="10" max="90" value={l} 
            onChange={(e) => updateColor('l', parseInt(e.target.value))}
            style={{ background: `linear-gradient(to right, #000, ${hslToHex(h, 100, 50)}, #fff)` }}
          />
          <span className="val">{l}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * VisualSwatch - For colors and themes
 */
const VisualSwatch = ({ id, label, color, active, onClick, children }) => (
  <motion.button
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(id)}
    className={`visual-swatch ${active ? 'active' : ''}`}
    style={{ '--sw-color': color }}
  >
    <div className="swatch-preview">
      {children || <div className="swatch-color" />}
      {active && (
        <motion.div 
          layoutId="swatch-active"
          className="swatch-check"
        >
          <Check size={12} strokeWidth={3} />
        </motion.div>
      )}
    </div>
    <span className="swatch-label">{label}</span>
  </motion.button>
)

/**
 * ProfileCustomizer - The main panel component
 */
const ProfileCustomizer = ({ 
  custom, 
  updateCustom, 
  accent, 
  isAuthenticated, 
  user,
  stats,
  handlePhotoUpload,
  removePhoto,
  profilePhoto,
  BG_THEMES,
  FONTS,
  XP_STYLES,
  CURSOR_STYLES,
  PLAYER_TAGS
}) => {
  const [activeCat, setActiveCat] = React.useState('identity')
  const fileInputRef = React.useRef(null)

  const CATEGORIES = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'env', label: 'Environment', icon: Monitor },
    { id: 'prog', label: 'Progression', icon: Trophy },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'system', label: 'System', icon: Sliders },
  ]

  return (
    <div className="customizer-panel">
      {/* Category Sidebar */}
      <div className="customizer-categories">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            className={`cat-btn ${activeCat === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            <cat.icon size={16} />
            <span>{cat.label}</span>
            {activeCat === cat.id && <motion.div layoutId="cat-active" className="cat-indicator" />}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="customizer-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="customizer-pane"
          >
            {/* --- IDENTITY --- */}
            {activeCat === 'identity' && (
              <div className="pane-section">
                <header className="pane-header">
                   <h3>User Identity</h3>
                   <p>Personalize how others see you in the hub.</p>
                </header>

                <div className="custom-grid">
                   <div className="grid-item full">
                     <label>Accent Color</label>
                     <HSLColorPicker 
                       color={custom.avatarColor} 
                       onChange={(val) => updateCustom('avatarColor', val)} 
                     />
                   </div>


                   <div className="grid-item">
                     <label>Player Tag</label>
                     <div className="tag-picker">
                        {PLAYER_TAGS.map(tag => (
                          <button 
                            key={tag.id}
                            className={`tag-option ${custom.playerTag === tag.id ? 'active' : ''}`}
                            onClick={() => updateCustom('playerTag', tag.id)}
                          >
                            {tag.label}
                          </button>
                        ))}
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- ENVIRONMENT --- */}
            {activeCat === 'env' && (
              <div className="pane-section">
                 <header className="pane-header">
                   <h3>Immersive Worlds</h3>
                   <p>Select a living environment for your dashboard.</p>
                </header>
                
                <div className="theme-gallery">
                    {BG_THEMES.map(theme => {
                      const isCustom = theme.id === 'custom-image';

                      return (
                        <div key={theme.id} className={`theme-card-wrapper ${isCustom ? 'custom-card-wrapper' : ''}`}>
                          <button 
                            className={`theme-card ${custom.bgTheme === theme.id ? 'active' : ''} ${isCustom ? 'is-custom-uploader' : ''}`}
                            onClick={() => {
                              if (isCustom) {
                                fileInputRef.current?.click();
                              } else {
                                updateCustom('bgTheme', theme.id);
                              }
                            }}
                          >
                            {!isCustom ? (
                              <>
                                <span className="theme-label">{theme.label}</span>
                                {custom.bgTheme === theme.id && (
                                  <motion.div layoutId="theme-active" className="theme-dot" style={{ background: accent }} />
                                )}
                              </>
                            ) : (
                              <>
                                <div className="uploader-content">
                                  <div className="uploader-icon-ring" style={{ '--accent': accent }}>
                                    <ImageIcon size={18} />
                                  </div>
                                  <span className="theme-label">{custom.customBgUrl ? 'Custom Image' : 'Upload Image'}</span>
                                  <div className="custom-bg-status">
                                    <Upload size={10} />
                                    <span>{custom.customBgUrl ? 'Change' : 'Browse'}</span>
                                  </div>
                                </div>
                                {custom.bgTheme === theme.id && (
                                  <motion.div layoutId="theme-active" className="theme-dot" style={{ background: accent }} />
                                )}
                              </>
                            )}
                          </button>
                          
                          {isCustom && (
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    updateCustom('customBgUrl', ev.target.result);
                                    updateCustom('bgTheme', 'custom-image');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                </div>


              </div>
            )}

            {/* --- PROGRESSION --- */}
            {activeCat === 'prog' && (
              <div className="pane-section progression-pane">
                <header className="pane-header">
                   <h3>Progression Systems</h3>
                   <p>Customize the visual manifestation of your power level.</p>
                </header>
                
                <div className="custom-grid">
                   <div className="grid-item full">
                     <label>XP Bar Blueprint</label>
                      <div className="skin-grid">
                        {XP_STYLES.map(s => (
                          <motion.button
                            key={s.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`skin-card ${custom.xpBarStyle === s.id ? 'active' : ''}`}
                            onClick={() => updateCustom('xpBarStyle', s.id)}
                            style={{ '--skin-accent': accent }}
                          >
                            <div className="skin-card__preview">
                              <XPBar 
                                currentXP={65} 
                                maxXP={100} 
                                accent={accent} 
                                style={s.id} 
                                hideHeader 
                              />
                              <div className="skin-card__overlay" />
                            </div>
                            <div className="skin-card__info">
                              <span className="skin-card__label">{s.label}</span>
                              <div className="skin-card__status">
                                {custom.xpBarStyle === s.id ? (
                                  <><Check size={12} /> <span>Active</span></>
                                ) : (
                                  <span>Select Skin</span>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- AUDIO --- */}
            {activeCat === 'audio' && (
              <div className="pane-section">
                <header className="pane-header">
                   <h3>Audio Balance</h3>
                   <p>Fine-tune music and effect volumes.</p>
                </header>
                
                <div className="audio-controls">
                   <div className="control-row">
                      <div className="icon-wrap"><Music size={20} /></div>
                      <div className="slider-wrap">
                        <label>Background Music</label>
                        <RangeSlider 
                          value={custom.musicVolume} 
                          onChange={(v) => updateCustom('musicVolume', v)}
                          color={accent}
                        />
                      </div>
                   </div>
                   <div className="control-row">
                      <div className="icon-wrap"><Gamepad2 size={20} /></div>
                      <div className="slider-wrap">
                        <label>Game Effects</label>
                        <RangeSlider 
                          value={custom.sfxVolume} 
                          onChange={(v) => updateCustom('sfxVolume', v)}
                          color="#22d3ee"
                        />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- SYSTEM --- */}
            {activeCat === 'system' && (
              <div className="pane-section">
                <header className="pane-header">
                   <h3>Performance Engine</h3>
                   <p>Optimize for your hardware capabilities.</p>
                </header>
                
                <div className="toggle-stack">
                   <div className="toggle-item">
                      <div className="toggle-info">
                        <h4>Hardware Acceleration</h4>
                        <p>Uses GPU for smooth 60fps animations.</p>
                      </div>
                      <ToggleSwitch 
                        checked={custom.hwAcceleration} 
                        onChange={(v) => updateCustom('hwAcceleration', v)}
                        color="#22c55e"
                      />
                   </div>
                   <div className="toggle-item">
                      <div className="toggle-info">
                        <h4>Reduced Motion</h4>
                        <p>Disables heavy parallax and physics effects.</p>
                      </div>
                      <ToggleSwitch 
                        checked={custom.reducedMotion} 
                        onChange={(v) => updateCustom('reducedMotion', v)}
                        color={accent}
                      />
                   </div>
                </div>

                <div className="slider-group">
                   <div className="slider-item">
                      <div className="slider-info">
                        <h4>Dashboard Transparency</h4>
                        <p>Adjust the glass background opacity.</p>
                      </div>
                      <RangeSlider 
                        value={custom.dashboardOpacity} 
                        onChange={(v) => updateCustom('dashboardOpacity', v)}
                        min={0} max={100}
                        color={accent}
                      />
                   </div>
                   <div className="slider-item">
                      <div className="slider-info">
                        <h4>Dashboard Blur</h4>
                        <p>Adjust the backdrop filter strength.</p>
                      </div>
                      <RangeSlider 
                        value={custom.dashboardBlur} 
                        onChange={(v) => updateCustom('dashboardBlur', v)}
                        min={0} max={64}
                        color={accent}
                      />
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default React.memo(ProfileCustomizer);

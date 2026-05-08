import * as React from 'react'
import ShinyText from '../components/ShinyText'
import GameCard from '../components/GameCard'
import CustomDropdown from '../components/CustomDropdown'
import { AnimatedAvatar, XPBar } from '../components/AnimatedIcons'
import ToggleSwitch from '../components/ToggleSwitch'
import RangeSlider from '../components/RangeSlider'
import ActivityFeed from '../components/profile/ActivityFeed'
import EnvironmentEngine from '../components/profile/EnvironmentEngine'
import CustomizationPanel from '../components/profile/CustomizationPanel'
import '../components/profile/CustomizationPanel.css'
import '../components/AnimatedIcons.css'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { 
  updateUserProfile, 
  loadXPData, 
  syncXPData, 
  syncToCloud, 
  loadFromCloud,
  getAllGameSaves 
} from '../lib/cloudSaves'
import SaveManager from '../components/SaveManager'
import { checkUsername } from '../lib/profanityFilter'
import { getStats, timeAgo, ACHIEVEMENTS } from '../lib/xpEngine'
import {
  Upload, Image as ImageIcon,
  Heart, Gamepad2, Clock, Settings, Trash2, ShieldAlert,
  Edit3, Check, X, Award, Star, Zap, Flame, Palette,
  Camera, Activity, History, Sparkles, Frame, Trophy,
  Gauge, Volume2, Monitor, Music, Layers, HardDrive,
  CircleDot, Hexagon, Diamond, Shield, Square, User, MousePointer2, Sliders, Type as TypeIcon,
  Eye, EyeOff
} from 'lucide-react'
import './ProfilePage.css'

// ——— Customization Data ——— //

// AVATAR_THEMES removed in favor of HSL Color Picker

const PLAYER_TAGS = [
  { id: 'none', label: 'No Title' },
  { id: 'rising', label: '🌟 Rising' },
  { id: 'veteran', label: '🔥 Veteran' },
  { id: 'pro', label: '⚡ Pro Gamer' },
  { id: 'completionist', label: '🏆 Completionist' },
  { id: 'arcade', label: '👾 Arcade Junky' }
]

const BG_THEMES = [
  { id: 'dither-waves', label: 'Dithered Waves' },
  { id: 'starfield-warp', label: 'Starfield Warp' },
  { id: 'dna-lattice', label: 'DNA Lattice' },
  { id: 'cyber-tunnel', label: 'Cyber Tunnel' },
  { id: 'comet-shower', label: 'Comet Shower' },
  { id: 'pixel-nebula', label: 'Pixel Nebula' },
  { id: 'magnetic-field', label: 'Magnetic Field' },
  { id: 'circuit-trace', label: 'Circuit Trace' },
  { id: 'smoke-drift', label: 'Smoke Drift' },
  { id: 'custom-image', label: '🖼️ Custom Background' }
]

const XP_STYLES = [
  { id: 'default', label: 'Solid Core' },
  { id: 'minimal-line', label: 'Void Tracer' },
  { id: 'glass-tube', label: 'Crystalline Core' },
  { id: 'gradient-flow', label: 'Plasma Flow' },
  { id: 'segmented', label: 'Kinetic Cells' },
  { id: 'neon-rail', label: 'Voltage Rail' },
  { id: 'liquid-fill', label: 'Fluid Motion' },
  { id: 'pixel-blocks', label: 'Retro Matrix' },
  { id: 'vapor-wave', label: 'Dreamscape' },
  { id: 'cyber-pulse', label: 'Neural Link' }
]



const FONTS = [
  { id: 'default', label: 'System Default' },
  { id: 'pixel', label: 'Retro Pixel' },
  { id: 'arcade', label: 'Arcade Classic' },
  { id: 'cyber', label: 'Cyberpunk' },
  { id: 'inter', label: 'Clean Inter' },
  { id: 'space-grotesk', label: 'Space Grotesk' }
]

const CURSOR_STYLES = [
  { id: 'default', label: 'System Default' },
  { id: 'minimal-dot', label: 'Minimal Dot' },
  { id: 'sleek-arrow', label: 'Sleek Arrow' },
  { id: 'mac-os-classic', label: 'Mac OS Classic' },
  { id: 'cyber-pointer', label: 'Cyber Pointer' }
]

const DEFAULT_CUSTOM = {
  avatarColor: '#8b5cf6',
  avatarShape: 'circle',
  avatarRingStyle: 'none',
  profileGlowColor: '#8b5cf6',
  profileFrame: 'none',
  nameFontFamily: 'default',
  nameEffect: 'none',
  nameFontWeight: 'bold',
  nameTransform: 'none',
  nameGlowIntensity: 10,
  playerTag: 'rising',
  tagColor: '#22d3ee',
  bgTheme: 'dither-waves',
  customBgUrl: '',
  customBgType: 'image',
  particleDensity: 50,
  xpBarStyle: 'default',
  cursorStyle: 'default',
  reducedMotion: false,
  dashboardOpacity: 32,
  dashboardBlur: 22,
}

// ——— Animated counting hook ——— //
function useCountUp(end, duration = 1200) {
  const [count, setCount] = React.useState(0)
  
  React.useEffect(() => {
    if (end === 0) { setCount(0); return }
    
    let startTime = null;
    let animationFrame = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const eased = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(eased * end);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration])
  
  return Math.floor(count)
}

export default function ProfilePage({ 
  navigate, 
  onPlayGame, 
  lastPlayed, 
  xpData,
  customization,
  setCustomization 
}) {
  const { audioEnabled, setAudioEnabled, clearAllData } = useSettings()
  const [activeTab, setActiveTab] = React.useState('overview')
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)
  const [isHudHidden, setIsHudHidden] = React.useState(false)
  const { user, isAuthenticated, setUsername, setPhotoURL } = useAuth()
  
  const custom = customization || DEFAULT_CUSTOM
  const setCustom = setCustomization

  const [profilePhoto, setProfilePhoto] = React.useState(null)
  const [editingName, setEditingName] = React.useState(false)
  const [nameInput, setNameInput] = React.useState('')
  const [nameError, setNameError] = React.useState('')
  const nameInputRef = React.useRef(null)
  const profileRef = React.useRef(null)

  const profileName = isAuthenticated ? (user?.displayName || 'Player') : 'Guest Player'

  React.useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)
    else if (user?.photoURL) setProfilePhoto(user.photoURL)
  }, [user?.photoURL])

  const updateCustom = React.useCallback((key, value) => {
    if (!setCustom) return
    setCustom(prev => {
      const next = { ...(prev || DEFAULT_CUSTOM), [key]: value }
      localStorage.setItem('profileCustomization', JSON.stringify(next))
      return next
    })
  }, [setCustom]);

  const stats = xpData ? getStats(xpData) : {
    level: 1, title: 'Newcomer', emoji: '🕹️',
    xpInLevel: 0, xpNeeded: 100, progress: 0,
    gamesPlayed: 0, totalFavorites: 0, totalPlaytimeMin: 0,
    currentStreak: 0, bestStreak: 0, unlockedCount: 0,
    totalAchievements: 12, xpLog: [],
    unlockedAchievements: {}
  }

  const animGames = useCountUp(stats.gamesPlayed || 0)
  const animPlaytime = useCountUp(stats.totalPlaytimeMin || 0)

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result
      setProfilePhoto(dataUrl)
      localStorage.setItem('profilePhoto', dataUrl)
      if (isAuthenticated && user?.uid) {
        setPhotoURL(dataUrl)
        try { await updateUserProfile(user.uid, { photoURL: dataUrl }) }
        catch (err) { console.error('Failed to save photo', err) }
      }
      window.dispatchEvent(new Event('profilePhotoChanged'))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = async () => {
    setProfilePhoto(null)
    localStorage.removeItem('profilePhoto')
    if (isAuthenticated && user?.uid) {
      setPhotoURL(null)
      try { await updateUserProfile(user.uid, { photoURL: null }) }
      catch (err) { console.error('Failed to remove photo', err) }
    }
    window.dispatchEvent(new Event('profilePhotoChanged'))
  }

  const saveUsername = async () => {
    const check = checkUsername(nameInput)
    if (!check.isClean) { setNameError(check.reason); return }
    try {
      if (isAuthenticated && user?.uid) {
        await updateUserProfile(user.uid, { displayName: nameInput.trim() })
        setUsername(nameInput.trim())
      }
      setEditingName(false); setNameError('')
    } catch { setNameError('Failed to update') }
  }

  const accent = custom.avatarColor

  const nextAch = ACHIEVEMENTS.filter(a => !(stats.unlockedAchievements || {})[a.id])
    .map(a => ({ ...a, currProg: xpData ? a.progress(xpData) : 0 }))
    .sort((a, b) => (b.currProg || 0) - (a.currProg || 0))[0]

  return (
    <main
      ref={profileRef}
      className={`profile gp-root cursor-${custom.cursorStyle}`}
      data-xp-style={custom.xpBarStyle}
      data-font={custom.nameFontFamily}
      style={{ 
        '--profile-accent': accent, /* Scoped to profile only [V4 Fix] */
        '--db-opacity': custom.dashboardOpacity / 100,
        '--db-blur': `${custom.dashboardBlur}px`
      }}
      data-bg-theme={custom.bgTheme}
    >
      <EnvironmentEngine 
        theme={custom.bgTheme} 
        accent={accent} /* Connected to user accent [V4 Fix] */
        density={custom.particleDensity} 
        reducedMotion={custom.reducedMotion}
        customBgUrl={custom.customBgUrl}
      />

      <div className="gp-body">
        <div className="gp-inner">
          <div className="gp-hud-header">
            <div className="gp-id-section">
              <div className="gp-av-wrap">
                <div
                  className={`gp-av-ring profile__avatar-frame--${custom.profileFrame} frame-ring-${custom.avatarRingStyle}`}
                  style={{ borderColor: accent, '--pglow': custom.profileGlowColor }}
                >
                    <div className={`gp-av avatar-shape-${custom.avatarShape}`}>
                      {profilePhoto
                        ? <img src={profilePhoto} alt="Profile" className="profile__avatar-img" />
                        : <AnimatedAvatar size="100%" color={accent} />
                      }
                    </div>
                </div>
                <label className="gp-av-edit" title="Change photo">
                  <Camera size={10} />
                  <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>



              <div className="gp-name-block">
                {editingName ? (
                  <div className="profile__edit-name">
                    <input ref={nameInputRef} value={nameInput}
                      onChange={e => { setNameInput(e.target.value); setNameError('') }}
                      placeholder={profileName} autoFocus />
                    <button onClick={saveUsername} className="profile__edit-save"><Check size={14} /></button>
                    <button onClick={() => setEditingName(false)} className="profile__edit-cancel"><X size={14} /></button>
                    {nameError && <span className="profile__edit-error">{nameError}</span>}
                  </div>
                ) : (
                    <div className="gp-name-row">
                      <h1 className="gp-name">
                        <ShinyText text={profileName} speed={3} color="#fff" shineColor={accent} />
                      </h1>
                      {isAuthenticated && (
                        <button onClick={() => { setNameInput(profileName); setEditingName(true) }} className="profile__edit-trigger">
                          <Edit3 size={11} />
                        </button>
                      )}
                      <div className="gp-visibility-wrapper">
                        <button 
                          className="gp-visibility-toggle-v4"
                          onClick={() => setIsHudHidden(!isHudHidden)}
                          title={isHudHidden ? "Show Dashboard" : "Hide Dashboard"}
                        >
                          {isHudHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>
                )}
                <div className="gp-meta-pills">
                  {custom.playerTag !== 'none' && (
                    <span className="gp-tag-v4" style={{ '--tag-color': custom.tagColor }}>
                      {PLAYER_TAGS.find(t => t.id === custom.playerTag)?.label}
                    </span>
                  )}
                  <span className="gp-rank-pill">{stats.emoji} {stats.title}</span>
                </div>
              </div>
            </div>

            {/* Right Section: Dominant Progression HUD */}
            <div className="gp-progression-hud">
              <div className="gp-xp-label-row">
                <span className="gp-lvl-text">LEVEL {stats.level}</span>
                <span className="gp-xp-text">{Math.round(stats.xpInLevel)} / {stats.xpNeeded} XP</span>
              </div>
              <div className="gp-xp-rail-v4">
                <XPBar 
                  style={custom.xpBarStyle} 
                  currentXP={Math.round(stats.xpInLevel)}
                  maxXP={stats.xpNeeded}
                  level={stats.level} 
                  accent={accent}
                  hideLevel={true}
                  hideHeader={true}
                />
              </div>
              <div className="gp-hud-stats">
                <div className="hud-stat-item">
                  <Gamepad2 size={12} /> <span>{stats.gamesPlayed} Games</span>
                </div>
                <div className="hud-stat-item">
                  <Flame size={12} /> <span>{stats.currentStreak}d Streak</span>
                </div>
                <div className="hud-stat-item">
                  <Award size={12} /> <span>{stats.unlockedCount} Trophies</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`gp-dashboard-shell ${isHudHidden ? 'hud-hidden' : ''}`}>
            <nav className="gp-tabs">
              {[
                { id: 'overview', icon: Gamepad2, label: 'Overview' },
                { id: 'activity', icon: Activity, label: 'Activity' },
                { id: 'saves', icon: HardDrive, label: 'Cloud Saves' },
                { id: 'achievements', icon: Award, label: 'Trophies' },
                { id: 'customize', icon: Palette, label: 'Customize' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`gp-tab ${activeTab === tab.id ? 'active' : ''}`}
                  style={activeTab === tab.id ? { '--tab-accent': accent } : {}}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <div className="gp-tab-line" />}
                </button>
              ))}
            </nav>

            <div className="gp-content">
              {activeTab === 'overview' && (
                <div className="gp-pane gp-bento-grid">
                  <div className="gp-bento-card gp-bento-card--main">
                    <div className="gp-bento-inner">
                      <Clock size={24} />
                      <div className="gp-bento-content">
                        <span className="gp-bento-label">Total Playtime</span>
                        <h2 className="gp-bento-val">{Math.floor(animPlaytime)} <small>MIN</small></h2>
                      </div>
                    </div>
                  </div>
                  <div className="gp-bento-card">
                    <Flame size={20} />
                    <span className="gp-bento-label">Best Streak</span>
                    <span className="gp-bento-val-sm">{stats.bestStreak}d</span>
                  </div>
                  <div className="gp-bento-card">
                    <Gamepad2 size={20} />
                    <span className="gp-bento-label">Library</span>
                    <span className="gp-bento-val-sm">{animGames}</span>
                  </div>
                  {nextAch && (
                    <div className="gp-bento-card gp-bento-card--wide">
                      <div className="gp-bento-header">
                        <Award size={14} /> <span>Next Trophy</span>
                        <span>{Math.floor(nextAch.currProg * 100)}%</span>
                      </div>
                      <div className="gp-ach-body-v2">
                        <div className="ach-icon-v2">{nextAch.icon}</div>
                        <div className="ach-info-v2">
                          <h4>{nextAch.title}</h4>
                          <p>{nextAch.desc}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && <ActivityFeed logs={stats.xpLog || []} />}
              {activeTab === 'saves' && <SaveManager />}
              
              {activeTab === 'achievements' && (
                <div className="gp-pane">
                  <div className="profile__ach-grid">
                    {ACHIEVEMENTS.map(ach => {
                      const unlocked = stats.unlockedAchievements?.[ach.id]
                      const progress = ach.progress(xpData)
                      return (
                        <div key={ach.id} className={`profile__ach-card ${unlocked ? 'unlocked' : ''}`}>
                          <div className="profile__ach-icon">{unlocked ? ach.icon : <X size={20} />}</div>
                          <div className="profile__ach-info">
                            <h4>{ach.title}</h4>
                            <p>{ach.desc}</p>
                            <XPBar style="minimal-line" currentXP={Math.round(progress * 100)} maxXP={100} accent={ach.color} hideLevel />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'customize' && (
                <CustomizationPanel 
                  custom={custom} 
                  updateCustom={updateCustom} 
                  accent={accent}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  stats={stats}
                  handlePhotoUpload={handlePhotoUpload}
                  removePhoto={removePhoto}
                  profilePhoto={profilePhoto}
                  BG_THEMES={BG_THEMES}
                  FONTS={FONTS}
                  XP_STYLES={XP_STYLES}
                  CURSOR_STYLES={CURSOR_STYLES}
                  PLAYER_TAGS={PLAYER_TAGS}
                />
              )}

              {activeTab === 'settings' && (
                <div className="gp-pane">
                  <div className="cust-section">
                    <div className="cust-header"><Volume2 size={16} /> <h3>Master Audio</h3></div>
                    <ToggleSwitch checked={audioEnabled} onChange={setAudioEnabled} color={accent} />
                  </div>
                  <button className="cust-danger-btn" onClick={() => { if(confirm('Reset all data?')) clearAllData() }}>
                    <Trash2 size={14} /> Reset All Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import ShinyText from '../components/ShinyText'
import GameCard from '../components/GameCard'
import RetroGridBackground from '../components/RetroGridBackground'
import CustomDropdown from '../components/CustomDropdown'
import { AnimatedAvatar, XPBar } from '../components/AnimatedIcons'
import HeroCyberMesh from '../components/effects/HeroCyberMesh'
import HeroVaporPrism from '../components/effects/HeroVaporPrism'
import HeroGlitchStrip from '../components/effects/HeroGlitchStrip'
import HeroMoltenEdge from '../components/effects/HeroMoltenEdge'
import HeroNeonHorizon from '../components/effects/HeroNeonHorizon'
import HeroArcLight from '../components/effects/HeroArcLight'
import ToggleSwitch from '../components/ToggleSwitch'
import RangeSlider from '../components/RangeSlider'
import '../components/AnimatedIcons.css'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, syncXPData, loadXPData } from '../lib/cloudSaves'
import { checkUsername } from '../lib/profanityFilter'
import { getStats, timeAgo, ACHIEVEMENTS } from '../lib/xpEngine'
import {
  Upload, Image as ImageIcon,
  Heart, Gamepad2, Clock, Settings, Trash2, ShieldAlert,
  Edit3, Check, X, Award, Star, Zap, Flame, Palette,
  Camera, Activity, History, Sparkles, Frame, Trophy,
  Gauge, Volume2, Monitor, Music, Layers,
  CircleDot, Hexagon, Diamond, Shield, Square, User, MousePointer2, Sliders, Type as TypeIcon
} from 'lucide-react'
import './ProfilePage.css'

// â”€â”€â”€ Customization Data â”€â”€â”€ //

const AVATAR_THEMES = [
  { id: 'purple', color: '#8b5cf6', label: 'Amethyst' },
  { id: 'cyan', color: '#22d3ee', label: 'Cyberpunk' },
  { id: 'green', color: '#22c55e', label: 'Matrix' },
  { id: 'pink', color: '#ec4899', label: 'Neon Rose' },
  { id: 'orange', color: '#f97316', label: 'Sunset' },
  { id: 'yellow', color: '#fbbf24', label: 'Gold' },
  { id: 'red', color: '#ef4444', label: 'Fire' },
  { id: 'teal', color: '#14b8a6', label: 'Ocean' },
]

const PROFILE_FRAMES = [
  { id: 'none', label: 'None', style: {} },
  { id: 'pulse', label: 'Pulse Ring', style: { animation: 'framePulse 2s infinite' } },
  { id: 'double', label: 'Double Ring', style: { boxShadow: '0 0 0 3px var(--accent), 0 0 0 6px rgba(255,255,255,0.1)' } },
  { id: 'glow', label: 'Neon Glow', style: { boxShadow: '0 0 20px var(--accent), 0 0 40px color-mix(in srgb, var(--accent) 30%, transparent)' } },
  { id: 'rainbow', label: 'Rainbow', style: { animation: 'frameRainbow 3s linear infinite' } },
  { id: 'glitch', label: 'Glitch', style: { animation: 'frameGlitch 4s infinite' } },
  { id: 'spin', label: 'Orbit', style: { animation: 'frameSpin 6s linear infinite' } },
  { id: 'breathe', label: 'Breathe', style: { animation: 'frameBreathe 3s ease-in-out infinite' } },
]

const BADGE_SHAPES = [
  { id: 'circle', label: 'Circle', Icon: CircleDot },
  { id: 'rounded', label: 'Rounded', Icon: Square },
  { id: 'hexagon', label: 'Hexagon', Icon: Hexagon },
  { id: 'diamond', label: 'Diamond', Icon: Diamond },
  { id: 'shield', label: 'Shield', Icon: Shield },
  { id: 'star', label: 'Star', Icon: Star },
]

const AMBIENT_PARTICLES = [
  { id: 'none', label: 'None' },
  { id: 'snow', label: 'Digital Snow' },
  { id: 'matrix', label: 'Matrix Rain' },
  { id: 'starfield', label: 'Starfield Warp' }
]

const BG_THEMES = [
  { id: 'matrix', label: 'Hack the Matrix' },
  { id: 'starfield', label: 'Warp Drive' },
  { id: 'cyberdust', label: 'Cyber Drift' },
  { id: 'ember-field', label: 'Void & Embers' },
  { id: 'ocean-depth', label: 'The Abyss' },
  { id: 'noir-rain', label: 'Noir Rain' },
  { id: 'neon-tokyo', label: 'Neon Tokyo' },
  { id: 'aurora-void', label: 'Aurora Void' },
  { id: 'solar-storm', label: 'Solar Storm' },
  { id: 'mind-palace', label: 'Mind Palace' },
  { id: 'custom', label: 'ðŸ–¼ï¸ My Vibe' }
]



const HERO_BANNERS = [
  { id: 'none', label: 'Clean & Dark' },
  { id: 'cyber-mesh', label: 'Cyber Mesh' },
  { id: 'vapor-prism', label: 'Vapor Prism' },
  { id: 'glitch-strip', label: 'Glitch Strip' },
  { id: 'molten-edge', label: 'Molten Edge' },
  { id: 'neon-horizon', label: 'Neon Horizon' },
  { id: 'arc-light', label: 'Arc Light' },
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
  { id: 'segmented', label: 'Clean Segments' },
  { id: 'neon-rail', label: 'Neon Rail' },
  { id: 'liquid-fill', label: 'Liquid Fill' },
  { id: 'pixel-blocks', label: 'Pixel Blocks' }
]

const CURSOR_STYLES = [
  { id: 'default', label: 'System Default' },
  { id: 'minimal-dot', label: 'Minimal Dot' },
  { id: 'sleek-arrow', label: 'Sleek Arrow' },
  { id: 'mac-os-classic', label: 'Mac OS Classic' },
  { id: 'cyber-pointer', label: 'Cyber Pointer' }
]

const PLAYER_TAGS = [
  { id: 'none', label: 'No Title' },
  { id: 'rising', label: 'ðŸŒŸ Rising' },
  { id: 'veteran', label: 'ðŸ”¥ Veteran' },
  { id: 'pro', label: 'âš¡ Pro Gamer' },
  { id: 'completionist', label: 'ðŸ† Completionist' },
  { id: 'arcade', label: 'ðŸ‘¾ Arcade Junky' }
]



const AVATAR_SHAPES = [
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

// â”€â”€â”€ Animated counting hook â”€â”€â”€ //
function useCountUp(end, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (end === 0) { setCount(0); return }
    let start = 0
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return count
}

// â”€â”€â”€ Load/Save profile customization â”€â”€â”€ //
const DEFAULT_CUSTOM = {
  // 1: Identity
  avatarColor: '#8b5cf6',
  avatarVfx: 'none',
  avatarShape: 'circle',
  avatarRingStyle: 'none',
  profileGlowColor: '#8b5cf6',
  profileFrame: 'none',
  frameThickness: 3,

  // 2: Typography
  nameFontFamily: 'default',
  nameEffect: 'none',
  nameFontWeight: 'bold',
  nameTransform: 'none',
  nameGlowIntensity: 10,
  titleAlignment: 'left',
  playerTag: 'rising',
  tagColor: '#22d3ee',

  // 3: Hero
  heroBanner: 'cyber-mesh',
  heroBannerTint: '#8b5cf6',
  heroOpacity: 100,
  heroGlowIntensity: 20,
  heroFloatPhysics: false,
  heroHeight: 'normal',
  heroOverlay: 'gradient-up',
  heroBorderRadius: 'rounded',
  heroParticles: 'none',

  // 4: Environment
  bgTheme: 'matrix',
  customBgUrl: '',
  customBgType: 'image',
  primaryAccent: '#8b5cf6',
  secondaryAccent: '#22d3ee',
  ambientParticles: 'none',
  particleDensity: 50,
  dynamicParallax: false,

  // 5: Progression
  badgeShape: 'circle',
  xpBarStyle: 'default',

  // 6: Audio
  musicVolume: 80,
  sfxVolume: 60,

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
}

function loadCustom() {
  try {
    const raw = localStorage.getItem('profileCustomization')
    const data = raw ? { ...DEFAULT_CUSTOM, ...JSON.parse(raw) } : { ...DEFAULT_CUSTOM }
    // Migration: reset stale values to valid defaults
    const validBgIds = ['matrix', 'starfield', 'cyberdust', 'abstract-waves', 'aurora-sky', 'neon-pulse', 'ember-field', 'ocean-depth', 'custom']
    const validBannerIds = ['none', 'plasma', 'scanline-fade', 'diamond-mesh', 'spotlight', 'ember-glow']
    if (!validBgIds.includes(data.bgTheme)) data.bgTheme = 'matrix'
    if (!validBannerIds.includes(data.heroBanner)) data.heroBanner = 'plasma'
    return data
  } catch { return { ...DEFAULT_CUSTOM } }
}

function saveCustom(data) {
  localStorage.setItem('profileCustomization', JSON.stringify(data))
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ProfilePage Component
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function ProfilePage({ navigate, favorites, toggleFavorite, onPlayGame, lastPlayed, xpData }) {
  const {
    audioEnabled, setAudioEnabled,
    clearAllData
  } = useSettings()

  const [activeTab, setActiveTab] = useState('overview')
  const [customCategory, setCustomCategory] = useState('identity')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { user, isAuthenticated, setUsername, setPhotoURL } = useAuth()
  const [custom, setCustom] = useState(loadCustom)

  // Profile state
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const nameInputRef = useRef(null)

  // Sync XP/achievements to cloud on mount (when authenticated)
  React.useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadXPData(user.uid).catch(err => console.error('XP cloud load failed:', err))
    }
    return () => {
      if (isAuthenticated && user?.uid) {
        syncXPData(user.uid).catch(() => { })
      }
    }
  }, [isAuthenticated, user?.uid])

  const profileName = isAuthenticated ? (user?.displayName || 'Player') : 'Guest Player'

  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) {
      setProfilePhoto(savedPhoto)
    } else if (user?.photoURL) {
      setProfilePhoto(user.photoURL)
    }
  }, [user?.photoURL])

  // Update a customization value
  const updateCustom = (key, value) => {
    setCustom(prev => {
      const next = { ...prev, [key]: value }
      saveCustom(next)
      return next
    })
  }

  // Stats from XP Engine
  const stats = xpData ? getStats(xpData) : {
    level: 1, title: 'Newcomer', emoji: 'ðŸ•¹ï¸',
    xpInLevel: 0, xpNeeded: 100, progress: 0,
    gamesPlayed: 0, totalFavorites: 0, totalPlaytimeMin: 0,
    currentStreak: 0, bestStreak: 0, unlockedCount: 0,
    totalAchievements: 12, xpLog: []
  }

  const animGames = useCountUp(stats.gamesPlayed)
  const animPlaytime = useCountUp(stats.totalPlaytimeMin)

  // Handlers
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
        catch (err) { console.error('Failed to save photo to cloud', err) }
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
      catch (err) { console.error('Failed to remove photo from cloud', err) }
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

  // Next Closest Achievement Logic
  const nextAch = ACHIEVEMENTS.filter(a => !stats.unlockedAchievements?.[a.id])
    .map(a => ({ ...a, currProg: a.progress(xpData) }))
    .sort((a, b) => b.currProg - a.currProg)[0]

  const BANNER_MAP = {
    'cyber-mesh': <HeroCyberMesh accent={accent} />,
    'vapor-prism': <HeroVaporPrism accent={accent} />,
    'glitch-strip': <HeroGlitchStrip accent={accent} />,
    'molten-edge': <HeroMoltenEdge accent={accent} />,
    'neon-horizon': <HeroNeonHorizon accent={accent} />,
    'arc-light': <HeroArcLight accent={accent} />,
  }

  // Fallback for legacy saved values (like 'plasma') not in current array
  const currentBannerId = HERO_BANNERS.find(b => b.id === custom.heroBanner) ? custom.heroBanner : 'cyber-mesh'
  const activeHeroBanner = currentBannerId === 'none' ? null : (BANNER_MAP[currentBannerId] || BANNER_MAP['cyber-mesh'])

  // â”€â”€â”€ Render â”€â”€â”€ //
  return (
    <>
      <div
        className={`gp-root cursor-${custom.cursorStyle}`}
        data-xp-style={custom.xpBarStyle}
        data-font={custom.nameFontFamily}
        style={{ '--accent': accent }}
        data-bg-theme={custom.bgTheme}
      >
        {/* Fixed animated background */}
        <RetroGridBackground theme={custom.bgTheme} particles={custom.ambientParticles} customBgUrl={custom.customBgUrl} customBgType={custom.customBgType} />

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            FULL-WIDTH HERO BANNER
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* Removed Hero Banner */}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SCROLLABLE BODY
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="gp-body">
          <div className="gp-inner">

            {/* â”€â”€ Identity Strip (avatar floats up into banner) â”€â”€ */}
            <div className="gp-id-strip">

              {/* Avatar */}
              <div className="gp-av-wrap">
                <div
                  className={`gp-av-ring profile__avatar-frame--${custom.profileFrame} frame-ring-${custom.avatarRingStyle}`}
                  style={{ borderColor: accent, '--pglow': custom.profileGlowColor }}
                >
                  <div className={`gp-av profile__avatar-vfx--${custom.avatarVfx} avatar-shape-${custom.avatarShape}`}>
                    {profilePhoto
                      ? <img src={profilePhoto} alt="Profile" className="profile__avatar-img" />
                      : <AnimatedAvatar size={88} color={accent} />
                    }
                  </div>
                </div>
                {custom.showLevelBadge && (
                  <div
                    className={`gp-lvl-badge profile__lvl-badge--${custom.badgeShape}`}
                    style={{ background: accent }}
                  >
                    {stats.level}
                  </div>
                )}
                <label className="gp-av-edit" title="Change photo">
                  <Camera size={11} />
                  <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>

              {/* Name + meta */}
              <div className="gp-id-info">
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
                    <h1
                      className={`gp-name profile__name--${custom.nameEffect} font-weight-${custom.nameFontWeight} text-trans-${custom.nameTransform}`}
                      style={{ textShadow: `0 0 ${custom.nameGlowIntensity}px var(--accent)` }}
                    >
                      <ShinyText text={profileName} speed={3} color="#fff" shineColor={accent} />
                    </h1>
                    {isAuthenticated && (
                      <button onClick={() => { setNameInput(profileName); setEditingName(true) }} className="profile__edit-trigger">
                        <Edit3 size={12} />
                      </button>
                    )}
                  </div>
                )}
                <div className="gp-meta">
                  {custom.playerTag !== 'none' && (
                    <span className="gp-tag" style={{ '--tag-color': custom.tagColor }}>
                      {PLAYER_TAGS.find(t => t.id === custom.playerTag)?.label}
                    </span>
                  )}
                  <span className="gp-title-pill">{stats.emoji} {stats.title}</span>
                </div>
              </div>

              {/* XP + quick stats â€” right side */}
              <div className="gp-xp-block">
                <div className="gp-xp-meta">
                  <span className="gp-xp-lvl">LVL {stats.level}</span>
                  <span className="gp-xp-frac">{Math.round(stats.xpInLevel)} / {stats.xpNeeded} XP</span>
                </div>
                <div className="gp-xp-rail">
                  <div className="gp-xp-fill" style={{ width: `${stats.progress * 100}%` }} />
                </div>
                <div className="gp-mini-stats">
                  <span><Gamepad2 size={11} /> {stats.gamesPlayed} games</span>
                  <span><Flame size={11} /> {stats.currentStreak}d streak</span>
                  <span><Award size={11} /> {stats.unlockedCount} trophies</span>
                </div>
              </div>
            </div>

            {/* â”€â”€ Tab Navigation â”€â”€ */}
            <nav className="gp-tabs">
              {[
                { id: 'overview', icon: Gamepad2, label: 'Overview' },
                { id: 'activity', icon: Activity, label: 'Activity' },
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

            {/* â”€â”€ Tab Content â”€â”€ */}
            <div className="gp-content">

              {/* â”€â”€ OVERVIEW â”€â”€ */}
              {activeTab === 'overview' && (
                <div className="gp-pane gp-pane--bento">
                  <div className="gp-stats-row">
                    {[
                      { label: 'Games Played', value: animGames.toLocaleString(), icon: Gamepad2, color: '#22d3ee' },
                      { label: 'Playtime (min)', value: animPlaytime.toLocaleString(), icon: Clock, color: '#8b5cf6' },
                      { label: 'Best Streak', value: stats.bestStreak.toLocaleString(), icon: Flame, color: '#f97316' },
                      { label: 'Achievements', value: `${stats.unlockedCount}/${stats.totalAchievements}`, icon: Award, color: '#fbbf24' }
                    ].map((s, i) => (
                      <div key={i} className="gp-stat-card" style={{ '--stat-color': s.color }}>
                        <div className="gp-stat-icon"><s.icon size={22} /></div>
                        <span className="gp-stat-val">{s.value}</span>
                        <span className="gp-stat-lbl">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="gp-bento-row">
                    {nextAch && (
                      <div className="gp-glass-card gp-next-ach">
                        <div className="gp-card-header"><Award size={14} /><span>Up Next</span></div>
                        <div className="gp-ach-body">
                          <div className="gp-ach-icon">{nextAch.icon}</div>
                          <div>
                            <h4 className="gp-ach-title">{nextAch.title}</h4>
                            <p className="gp-ach-desc">{nextAch.desc}</p>
                          </div>
                        </div>
                        <div className="gp-progress-row">
                          <span>Progress</span>
                          <span style={{ color: accent }}>{Math.floor(nextAch.currProg * 100)}%</span>
                        </div>
                        <div className="gp-prog-bar">
                          <div className="gp-prog-fill" style={{ width: `${nextAch.currProg * 100}%`, background: accent }} />
                        </div>
                      </div>
                    )}
                    {lastPlayed && (
                      <div className="gp-glass-card gp-last-played">
                        <div className="gp-card-header"><Zap size={14} /><span>Jump Back In</span></div>
                        <GameCard game={lastPlayed} navigate={navigate} isFavorite={favorites.includes(lastPlayed.id)} toggleFavorite={toggleFavorite} onPlay={onPlayGame} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* â”€â”€ ACTIVITY â”€â”€ */}
              {activeTab === 'activity' && (
                <div className="gp-pane">
                  {stats.xpLog.length > 0 ? (
                    <div className="profile__timeline">
                      {stats.xpLog.map((log, i) => (
                        <div key={i} className="profile__tl-item" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="profile__tl-dot" style={{ background: accent }} />
                          <div className="profile__tl-card">
                            <span className="profile__tl-time">{timeAgo(log.timestamp)}</span>
                            <div className="profile__tl-body">
                              <span className="profile__tl-reason">{log.reason}</span>
                              <span className="profile__tl-xp">+{log.amount} XP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profile__empty"><History size={40} /><p>No activity yet â€” play some games!</p></div>
                  )}
                </div>
              )}

              {/* â”€â”€ ACHIEVEMENTS â”€â”€ */}
              {activeTab === 'achievements' && (
                <div className="gp-pane">
                  <div className="profile__ach-grid">
                    {ACHIEVEMENTS.map(ach => {
                      const unlocked = stats.unlockedAchievements?.[ach.id]
                      const progress = ach.progress(xpData)
                      return (
                        <div key={ach.id} className={`profile__ach-card ${unlocked ? 'unlocked' : ''}`}>
                          <div className="profile__ach-icon" style={unlocked ? { background: `${ach.color}18`, color: ach.color } : {}}>
                            {unlocked ? ach.icon : 'ðŸ”’'}
                          </div>
                          <div className="profile__ach-info">
                            <h4>{ach.title}</h4>
                            <p>{ach.desc}</p>
                            <div className="profile__ach-bar-row">
                              <div className="profile__ach-bar">
                                <div className="profile__ach-bar-fill" style={{ width: `${progress * 100}%`, background: ach.color }} />
                              </div>
                              <span className="profile__ach-reward">+{ach.xpReward}</span>
                            </div>
                          </div>
                          {unlocked && <span className="profile__ach-date">{timeAgo(unlocked.unlockedAt)}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* â”€â”€ CUSTOMIZE â”€â”€ */}
              {activeTab === 'customize' && (
                <div className="gp-pane profile__pane--command">
                  <div className="command-sidebar">
                    {[
                      { id: 'identity', icon: User, label: 'Identity & Avatar' },
                      { id: 'typo', icon: TypeIcon, label: 'Typography' },
                      { id: 'env', icon: Monitor, label: 'Environment' },
                      { id: 'prog', icon: Trophy, label: 'Progression' },
                      { id: 'audio', icon: Music, label: 'Audio & Haptics' },
                      { id: 'cursor', icon: MousePointer2, label: 'Cursor & Nav' },
                      { id: 'perf', icon: Sliders, label: 'Performance' }
                    ].map(cat => (
                      <button key={cat.id}
                        className={`command-cat-btn ${customCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setCustomCategory(cat.id)}>
                        <cat.icon size={15} /> <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="command-content scrollbar-custom">
                    {/* Identity */}
                    {customCategory === 'identity' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Identity & Avatar</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-section"><div className="cust-header"><Camera size={14} /> <h3>Profile Photo</h3></div>
                            <div className="cust-photo-row">
                              <label className="cust-photo-btn cust-photo-btn--upload"><Camera size={14} /> Upload<input type="file" hidden accept="image/*" onChange={handlePhotoUpload} /></label>
                              {profilePhoto && <button className="cust-photo-btn cust-photo-btn--remove" onClick={removePhoto}><Trash2 size={14} /> Remove</button>}
                            </div>
                          </div>
                          <div className="cust-section"><div className="cust-header"><Palette size={14} /> <h3>Accent Colour</h3></div>
                            <div className="cust-swatches">
                              {AVATAR_THEMES.map(t => (
                                <button key={t.id} className={`cust-swatch ${custom.avatarColor === t.color ? 'active' : ''}`} style={{ '--sw-color': t.color }} onClick={() => updateCustom('avatarColor', t.color)}><span className="cust-swatch__dot" /></button>
                              ))}
                            </div>
                          </div>
                          <div className="cust-section"><div className="cust-header"><Sparkles size={14} /> <h3>Avatar VFX</h3></div><CustomDropdown options={AVATAR_VFX} value={custom.avatarVfx} onChange={v => updateCustom('avatarVfx', v)} /></div>
                          <div className="cust-section"><div className="cust-header"><Frame size={14} /> <h3>Profile Frame</h3></div><CustomDropdown options={PROFILE_FRAMES} value={custom.profileFrame} onChange={v => updateCustom('profileFrame', v)} /></div>
                        </div>
                      </div>
                    )}
                    {/* Typography */}
                    {customCategory === 'typo' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Typography & Titles</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-section"><div className="cust-header"><TypeIcon size={14} /> <h3>Font Family</h3></div><CustomDropdown options={FONTS} value={custom.nameFontFamily} onChange={v => updateCustom('nameFontFamily', v)} /></div>
                          <div className="cust-section"><div className="cust-header"><Sparkles size={14} /> <h3>Name Effect</h3></div><CustomDropdown options={NAME_EFFECTS} value={custom.nameEffect} onChange={v => updateCustom('nameEffect', v)} /></div>
                          <div className="cust-section"><div className="cust-header"><Award size={14} /> <h3>Player Tag</h3></div><CustomDropdown options={PLAYER_TAGS} value={custom.playerTag} onChange={v => updateCustom('playerTag', v)} /></div>
                        </div>
                      </div>
                    )}
                    {/* Removed Hero Banner Panel */}
                    {/* Environment */}
                    {customCategory === 'env' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Global Environment</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-section"><div className="cust-header"><Monitor size={14} /> <h3>Background Theme</h3></div><CustomDropdown options={BG_THEMES} value={custom.bgTheme} onChange={v => updateCustom('bgTheme', v)} /></div>
                          {custom.bgTheme === 'custom' && (
                            <div className="cust-section">
                              <div className="cust-header"><ImageIcon size={14} /> <h3>Custom Background</h3></div>
                              <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 10px' }}>Upload an image or video (max 5MB)</p>
                              <div className="cust-photo-row">
                                <label className="cust-photo-btn cust-photo-btn--upload">
                                  <Upload size={14} /> Upload
                                  <input type="file" hidden accept="image/*,video/mp4,video/webm" onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    if (file.size > 5 * 1024 * 1024) { alert('File too large (max 5MB)'); return }
                                    const isVideo = file.type.startsWith('video/')
                                    const reader = new FileReader()
                                    reader.onload = async ev => {
                                      const dataUrl = ev.target?.result
                                      updateCustom('customBgUrl', dataUrl)
                                      updateCustom('customBgType', isVideo ? 'video' : 'image')
                                      if (isAuthenticated && user?.uid) {
                                        try { await updateUserProfile(user.uid, { customBgUrl: dataUrl, customBgType: isVideo ? 'video' : 'image' }) }
                                        catch (err) { console.error(err) }
                                      }
                                    }
                                    reader.readAsDataURL(file)
                                  }} />
                                </label>
                                {custom.customBgUrl && (
                                  <button className="cust-photo-btn cust-photo-btn--remove" onClick={async () => {
                                    updateCustom('customBgUrl', ''); updateCustom('customBgType', 'image')
                                    if (isAuthenticated && user?.uid) {
                                      try { await updateUserProfile(user.uid, { customBgUrl: '', customBgType: 'image' }) } catch { }
                                    }
                                  }}><Trash2 size={14} /> Remove</button>
                                )}
                              </div>
                              {custom.customBgUrl && (
                                <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '120px' }}>
                                  {custom.customBgType === 'video'
                                    ? <video src={custom.customBgUrl} muted loop autoPlay playsInline style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                    : <img src={custom.customBgUrl} alt="Custom BG" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Progression */}
                    {customCategory === 'prog' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Progression</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-section"><div className="cust-header"><Gauge size={14} /> <h3>XP Bar Style</h3></div><CustomDropdown options={XP_STYLES} value={custom.xpBarStyle} onChange={v => updateCustom('xpBarStyle', v)} /></div>
                          <div className="cust-section"><div className="cust-header"><Trophy size={14} /> <h3>Badge Shape</h3></div><CustomDropdown options={BADGE_SHAPES} value={custom.badgeShape} onChange={v => updateCustom('badgeShape', v)} /></div>
                        </div>
                      </div>
                    )}
                    {/* Audio */}
                    {customCategory === 'audio' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Audio & Feedback</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-section"><div className="cust-header"><h3>Music Volume</h3></div><RangeSlider value={custom.musicVolume} min={0} max={100} onChange={v => updateCustom('musicVolume', v)} color={accent} unit="%" /></div>
                          <div className="cust-section"><div className="cust-header"><h3>SFX Volume</h3></div><RangeSlider value={custom.sfxVolume} min={0} max={100} onChange={v => updateCustom('sfxVolume', v)} color="#22d3ee" unit="%" /></div>
                        </div>
                      </div>
                    )}
                    {/* Cursor */}
                    {customCategory === 'cursor' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Cursor & Navigation</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-section"><div className="cust-header"><MousePointer2 size={14} /> <h3>Cursor Override</h3></div><CustomDropdown options={CURSOR_STYLES} value={custom.cursorStyle} onChange={v => updateCustom('cursorStyle', v)} /></div>
                        </div>
                      </div>
                    )}
                    {/* Performance */}
                    {customCategory === 'perf' && (
                      <div className="command-panel animate-fade-in">
                        <h2>Performance Engine</h2>
                        <div className="cust-accordion-grid">
                          <div className="cust-toggle-row">
                            <div className="cust-toggle-info"><span className="cust-toggle-label">Hardware Acceleration</span><span className="cust-toggle-desc">Utilizes GPU for graphics</span></div>
                            <ToggleSwitch checked={custom.hwAcceleration} onChange={v => updateCustom('hwAcceleration', v)} color="#22c55e" />
                          </div>
                          <div className="cust-toggle-row">
                            <div className="cust-toggle-info"><span className="cust-toggle-label">Reduced Motion</span><span className="cust-toggle-desc">Stops parallax and heavy physics</span></div>
                            <ToggleSwitch checked={custom.reducedMotion} onChange={v => updateCustom('reducedMotion', v)} color={accent} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* â”€â”€ SETTINGS â”€â”€ */}
              {activeTab === 'settings' && (
                <div className="gp-pane">
                  <div className="cust-section" style={{ marginBottom: 16 }}>
                    <div className="cust-header"><Volume2 size={16} /> <h3>Master Audio</h3></div>
                    <div className="cust-toggle-row">
                      <div className="cust-toggle-info">
                        <span className="cust-toggle-label">Enable Audio</span>
                        <span className="cust-toggle-desc">Toggle all sounds globally</span>
                      </div>
                      <ToggleSwitch checked={audioEnabled} onChange={setAudioEnabled} color={accent} />
                    </div>
                  </div>
                  <div className="cust-section cust-section--danger">
                    <div className="cust-header"><ShieldAlert size={16} /> <h3>Danger Zone</h3></div>
                    {!showClearConfirm ? (
                      <button className="cust-danger-btn" onClick={() => setShowClearConfirm(true)}><Trash2 size={14} /> Reset All Data</button>
                    ) : (
                      <div className="cust-confirm">
                        <p>âš ï¸ This permanently deletes all favorites, history, and progress.</p>
                        <div className="cust-confirm-btns">
                          <button className="cust-confirm-cancel" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                          <button className="cust-confirm-yes" onClick={clearAllData}>Yes, Wipe Everything</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>{/* /gp-content */}
          </div>{/* /gp-inner */}
        </div>{/* /gp-body */}
      </div>
    </>
  )
}


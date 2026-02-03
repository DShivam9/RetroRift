import React, { useState, useEffect } from 'react'
import ShinyText from '../components/ShinyText'
import GameCard from '../components/GameCard'
import { ShootingStars, StarsBackground } from '../components/ShootingStars'
import { TrophyCabinet } from '../components/AchievementBadge'
import SaveManager from '../components/SaveManager'
import { games, getGameById } from '../data/games'
import { useSettings } from '../context/SettingsContext'
import { User, Heart, Gamepad2, Clock, Upload, Settings, Volume2, Monitor, Trash2, ShieldAlert } from 'lucide-react'
import './ProfilePage.css'

export default function ProfilePage({ navigate, favorites, toggleFavorite, onPlayGame, lastPlayed }) {
  const {
    audioEnabled, setAudioEnabled,
    musicVolume, setMusicVolume,
    crtMode, setCrtMode,
    scanlines, setScanlines,
    clearAllData
  } = useSettings()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'settings'
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profileName, setProfileName] = useState('Player One')

  // Load profile from localStorage
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    const savedName = localStorage.getItem('profileName')
    if (savedPhoto) setProfilePhoto(savedPhoto)
    if (savedName) setProfileName(savedName)
  }, [])

  // Get play history
  const playHistory = (() => {
    try {
      const raw = localStorage.getItem('playHistory')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  // Get favorite games
  const favoriteGames = games.filter(g => favorites.includes(g.id))

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      setProfilePhoto(dataUrl)
      localStorage.setItem('profilePhoto', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="profile">
      <div className="profile__bg">
        <StarsBackground starDensity={0.0002} />
        <ShootingStars starColor="#8b5cf6" trailColor="#22d3ee" />
      </div>

      <div className="profile__container">
        {/* Header Card */}
        <div className="profile__header">
          <div className="profile__avatar-wrap">
            <div className="profile__avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="profile__avatar-img" />
              ) : (
                <User className="profile__avatar-icon" />
              )}
            </div>
            <label className="profile__avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="profile__avatar-input"
              />
              <Upload size={14} />
            </label>
          </div>

          <div className="profile__info" style={{ minWidth: '220px' }}>
            <h1 className="profile__name">
              <ShinyText
                text={profileName}
                speed={3}
                className=""
                color="#ffffff"
                shineColor="#8b5cf6"
              />
            </h1>
            <p className="profile__bio">Retro gaming enthusiast</p>
          </div>

          {/* Tab Switcher */}
          <div className="profile__tabs">
            <button
              className={`profile__tab-btn ${activeTab === 'overview' ? 'profile__tab-btn--active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`profile__tab-btn ${activeTab === 'settings' ? 'profile__tab-btn--active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              Config
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats */}
            <div className="profile__stats">
              <div className="profile__stat">
                <Heart className="profile__stat-icon profile__stat-icon--pink" />
                <div className="profile__stat-content">
                  <span className="profile__stat-value">{favorites.length}</span>
                  <span className="profile__stat-label">Favorites</span>
                </div>
              </div>
              <div className="profile__stat">
                <Gamepad2 className="profile__stat-icon profile__stat-icon--cyan" />
                <div className="profile__stat-content">
                  <span className="profile__stat-value">{playHistory.length}</span>
                  <span className="profile__stat-label">Sessions</span>
                </div>
              </div>
              <div className="profile__stat">
                <Clock className="profile__stat-icon profile__stat-icon--purple" />
                <div className="profile__stat-content">
                  <span className="profile__stat-value">4</span>
                  <span className="profile__stat-label">Consoles</span>
                </div>
              </div>
            </div>

            {/* Continue Playing */}
            {lastPlayed && (
              <section className="profile__section">
                <h2 className="profile__section-title">
                  <ShinyText text="Continue Playing" speed={3} color="#ffffff" shineColor="#8b5cf6" />
                </h2>
                <div className="profile__featured-card" style={{ width: '300px', flexShrink: 0, overflow: 'hidden' }}>
                  <GameCard
                    game={lastPlayed}
                    navigate={navigate}
                    isFavorite={favorites.includes(lastPlayed.id)}
                    toggleFavorite={toggleFavorite}
                    onPlay={onPlayGame}
                  />
                </div>
              </section>
            )}

            {/* Favorites */}
            {favoriteGames.length > 0 && (
              <section className="profile__section">
                <div className="profile__section-header">
                  <h2 className="profile__section-title">
                    <ShinyText text="Your Favorites" speed={3} color="#ffffff" shineColor="#8b5cf6" />
                  </h2>
                  <button
                    className="btn btn--ghost"
                    onClick={() => navigate('favorites')}
                  >
                    View All →
                  </button>
                </div>
                <div className="game-grid">
                  {favoriteGames.slice(0, 4).map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      navigate={navigate}
                      isFavorite={true}
                      toggleFavorite={toggleFavorite}
                      onPlay={onPlayGame}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Games */}
            {playHistory.length > 0 && (
              <section className="profile__section">
                <h2 className="profile__section-title">
                  <ShinyText text="Recent Games" speed={3} color="#ffffff" shineColor="#8b5cf6" />
                </h2>
                <div className="profile__recent">
                  {playHistory.slice(0, 5).map((item, i) => (
                    <button
                      key={i}
                      className="profile__recent-item"
                      onClick={() => onPlayGame(item)}
                    >
                      <span className="profile__recent-emoji">{item.thumbnail}</span>
                      <div className="profile__recent-info">
                        <span className="profile__recent-title">{item.title}</span>
                        <span className="profile__recent-console">{item.console}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            <section className="profile__section">
              <TrophyCabinet stats={{
                gamesPlayed: playHistory.length,
                totalPlaytime: 0,
                favorites: favorites.length,
                sessionGames: 0,
                consolesPlayed: new Set(playHistory.map(g => g.console)).size
              }} />
            </section>

            {/* Save Manager */}
            <section className="profile__section">
              <SaveManager />
            </section>
          </>
        ) : (
          /* Settings Tab */
          <div className="settings-panel fade-in-up">

            {/* Visuals Section */}
            <section className="settings-section">
              <h3 className="settings-title">
                <Monitor className="settings-icon" /> Visual System
              </h3>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">CRT Simulation</span>
                    <span className="setting-desc">Simulate curved screen and vignette</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={crtMode}
                      onChange={(e) => setCrtMode(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Scanlines</span>
                    <span className="setting-desc">Add retro TV scanline overlay</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={scanlines}
                      onChange={(e) => setScanlines(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Audio Section */}
            <section className="settings-section">
              <h3 className="settings-title">
                <Volume2 className="settings-icon" /> Audio System
              </h3>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Master Audio</span>
                    <span className="setting-desc">Enable/Disable all app sounds</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={audioEnabled}
                      onChange={(e) => setAudioEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Data Section */}
            <section className="settings-section settings-section--danger">
              <h3 className="settings-title">
                <ShieldAlert className="settings-icon" /> Data Management
              </h3>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Factory Reset</span>
                    <span className="setting-desc">Clear Favorites, History, and Settings</span>
                  </div>
                  {!showClearConfirm ? (
                    <button
                      className="btn btn--danger"
                      onClick={() => setShowClearConfirm(true)}
                    >
                      Reset Data
                    </button>
                  ) : (
                    <div className="confirm-actions">
                      <span className="confirm-text">Are you sure? This cannot be undone.</span>
                      <button className="btn btn--ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                      <button className="btn btn--danger" onClick={clearAllData}>Yes, Wipe It</button>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}

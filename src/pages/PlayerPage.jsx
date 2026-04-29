import React, { useState, useRef, useEffect, useCallback } from 'react'
import GBAEmulator from '../lib/gba-emulator'
import { Loader } from '../components/Loader'
import SaveNameModal from '../components/SaveNameModal'
import { games } from '../data/games'
import { useAuth } from '../context/AuthContext'
import { saveGameState, loadGameState, downloadSaveState, deleteSaveState } from '../lib/cloudSaves'
import { onPlayTimeRecorded } from '../lib/xpEngine'
import { sanitizeSaveName } from '../lib/inputSanitizer'
import {
  Save, FolderOpen, Trash2, ChevronRight, Star, Clock,
  Gamepad2, Calendar, MapPin, Zap, Heart, Play, Volume2, Cloud, CloudOff, AlertTriangle, Edit3, LogIn,
  Cpu, ShieldCheck, Info, HardDrive
} from 'lucide-react'
import '../styles/components.css'
import './PlayerPage.css'

/**
 * PlayerPage - Enhanced Emulator Page
 * Game details now come directly from the auto-generated catalog (games.js)
 */
export default function PlayerPage({ navigate, game, favorites = [], toggleFavorite, onPlayGame, xpData, setXpData }) {
  const currentGame = game || { title: 'Select a Game', console: 'N/A', year: '----', romPath: null }
  const details = {
    description: currentGame.description || 'A classic gaming experience.',
    region: currentGame.console || 'Unknown',
    genre: currentGame.genre || 'Game',
    developer: currentGame.developer || 'Unknown',
    difficulty: currentGame.difficulty || 'Unknown',
    playtime: currentGame.playtime || 'Varies',
    rating: currentGame.rating || 4.0,
    features: currentGame.features || []
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playtime, setPlaytime] = useState(0)
  const [romData, setRomData] = useState(null)
  const [saveSlots, setSaveSlots] = useState([])
  const [saveMessage, setSaveMessage] = useState('')
  const [savingToCloud, setSavingToCloud] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveModalMode, setSaveModalMode] = useState(null) // 'new' | { type: 'rename', saveId }
  const [saveModalDefault, setSaveModalDefault] = useState('')
  const [downloadingSave, setDownloadingSave] = useState(null) // saveId of slot being downloaded
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const emulatorRef = useRef(null)
  const { user, isAuthenticated } = useAuth()

  const MAX_SAVE_SLOTS = 5

  // Simple games don't support save states (e.g. Pac-Man, Tetris)
  const NON_SAVE_GENRES = ['Arcade', 'Puzzle', 'Sports']
  const isEndless = details.playtime?.toLowerCase().includes('endless')
  const supportsSaves = currentGame.romPath && !NON_SAVE_GENRES.includes(details.genre) && !isEndless

  const isFavorite = favorites?.includes(currentGame.id)

  // Get similar games (same console or genre)
  const similarGames = games.filter(g =>
    g.id !== currentGame.id &&
    (g.console === currentGame.console ||
      g.genre === details.genre)
  ).slice(0, 4)

  // Ensure page starts at top on every mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentGame.id])

  // Load existing save slots (local + cloud, only for games that support saves)
  useEffect(() => {
    if (!supportsSaves) return
    const loadSaves = async () => {
      // Always load from localStorage first (has actual stateData)
      if (currentGame.id) {
        const saved = localStorage.getItem(`saves_${currentGame.id}`)
        if (saved) {
          try {
            setSaveSlots(JSON.parse(saved))
          } catch { /* ignore bad JSON */ }
        }
      }
      // Then merge metadata from cloud
      if (currentGame.id && isAuthenticated && user?.uid) {
        try {
          const cloudData = await loadGameState(user.uid, currentGame.id)
          if (cloudData?.slots) {
            // Merge cloud metadata (names, etc) with local stateData
            setSaveSlots(prev => {
              return cloudData.slots.map(cloudSlot => {
                const local = prev.find(l => l.id === cloudSlot.id)
                return {
                  ...cloudSlot,
                  stateData: local?.stateData || cloudSlot.stateData || null // Prefer local, fallback to cloud
                }
              })
            })
          }
        } catch (err) {
          console.error('Cloud metadata load failed:', err)
        }
      }
    }
    loadSaves()
  }, [currentGame.id, isAuthenticated, user?.uid, supportsSaves])

  // Prevent arrow keys / game keys from scrolling the page while emulator is active
  useEffect(() => {
    const GAME_KEYS = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      ' ', 'Space', 'Enter', 'Shift', 'Tab',
      'x', 'X', 'z', 'Z', 'a', 'A', 's', 'S'
    ]
    const preventScroll = (e) => {
      if (emulatorRef.current && GAME_KEYS.includes(e.key)) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', preventScroll, { passive: false })
    return () => window.removeEventListener('keydown', preventScroll)
  }, [])

  // Track real play time
  const playStartRef = useRef(Date.now())
  useEffect(() => {
    playStartRef.current = Date.now()
    return () => {
      const elapsedMs = Date.now() - playStartRef.current
      const elapsedMin = elapsedMs / 60000
      if (elapsedMin >= 0.5 && setXpData) {
        setXpData(prev => onPlayTimeRecorded(prev, elapsedMin))
      }
    }
  }, [setXpData])

  // Load ROM
  const loadROM = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setRomData(null)

      const response = await fetch(currentGame.romPath)
      if (!response.ok) throw new Error('ROM file not found')
      const data = await response.arrayBuffer()

      setRomData(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [currentGame.romPath])

  // Cleanup and load on game change
  useEffect(() => {
    let timeoutId = null

    if (emulatorRef.current) {
      emulatorRef.current.destroy()
      emulatorRef.current = null
      setRomData(null)
    }

    if (currentGame.romPath) {
      // Small delay to let page transition finish smoothly
      timeoutId = setTimeout(() => {
        loadROM()
      }, 150)
      intervalRef.current = setInterval(() => setPlaytime(t => t + 1), 1000)
    } else {
      setLoading(false)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (emulatorRef.current) {
        emulatorRef.current.destroy()
        emulatorRef.current = null
      }
      const gameDiv = document.getElementById('game')
      if (gameDiv) gameDiv.remove()
    }
  }, [currentGame.id, loadROM])

  // Initialize emulator after ROM loads
  useEffect(() => {
    if (romData && canvasRef.current && !emulatorRef.current) {
      try {
        let system = 'gba'
        const rawConsole = currentGame.console ? currentGame.console.toUpperCase() : ''
        
        if (rawConsole === 'NES') system = 'nes'
        if (rawConsole === 'SNES') system = 'snes'
        if (rawConsole === 'SEGACD') system = 'segaCD'
        if (rawConsole === 'NDS') system = 'nds'
        if (rawConsole === 'GB') system = 'gb'
        if (rawConsole === 'GBC') system = 'gbc'

        emulatorRef.current = new GBAEmulator(canvasRef.current, system)
        emulatorRef.current.loadROM(romData)
        emulatorRef.current.start()
      } catch (err) {
        setError('Failed to start emulator')
      }
    }
  }, [romData, currentGame.console])

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Save state handlers — requires auth
  const handleSaveState = () => {
    if (!isAuthenticated) {
      setSaveMessage('Sign in to save your progress')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }
    if (!emulatorRef.current) {
      setSaveMessage('Emulator not ready')
      setTimeout(() => setSaveMessage(''), 2000)
      return
    }
    if (saveSlots.length >= MAX_SAVE_SLOTS) {
      setSaveMessage(`Max ${MAX_SAVE_SLOTS} saves! Delete one first.`)
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }
    // Open themed modal instead of prompt()
    setSaveModalMode('new')
    setSaveModalDefault(`Save ${saveSlots.length + 1}`)
    setSaveModalOpen(true)
  }

  // Called when user confirms save name from modal
  const handleSaveConfirm = async (rawName) => {
    setSaveModalOpen(false)
    const saveName = sanitizeSaveName(rawName)

    if (saveModalMode === 'new') {
      try {
        setSavingToCloud(true)
        const stateData = await emulatorRef.current.saveState()
        const newSave = {
          id: Date.now(),
          name: saveName,
          date: new Date().toLocaleString(),
          playtime: formatTime(playtime),
          slot: saveSlots.length + 1,
          stateData: stateData
        }
        const updatedSlots = [...saveSlots, newSave]
        setSaveSlots(updatedSlots)
        localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))

        // Sync metadata and binary to cloud
        if (isAuthenticated && user?.uid) {
          try {
            const cloudSlots = await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
            if (cloudSlots) {
              setSaveSlots(cloudSlots.map(cs => {
                const local = updatedSlots.find(l => l.id === cs.id)
                return { ...cs, stateData: local?.stateData || null }
              }))
            }
            setSaveMessage('Saved to cloud! ☁️')
          } catch (err) {
            console.error('Cloud save failed:', err)
            setSaveMessage('Saved locally (cloud sync failed)')
          }
        }
        setTimeout(() => setSaveMessage(''), 2000)
      } catch (error) {
        console.error('Save state error:', error)
        if (error.code === 'resource-exhausted' || error.message.includes('size')) {
           setSaveMessage('Saved locally (Save file too large for cloud sync)')
        } else {
           setSaveMessage('Save failed — emulator may not support saves for this game')
        }
        setTimeout(() => setSaveMessage(''), 3000)
      } finally {
        setSavingToCloud(false)
      }
    } else if (saveModalMode?.type === 'rename') {
      const updatedSlots = saveSlots.map(s =>
        s.id === saveModalMode.saveId ? { ...s, name: saveName } : s
      )
      setSaveSlots(updatedSlots)
      localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))
      if (isAuthenticated && user?.uid) {
        saveGameState(user.uid, currentGame.id, { slots: updatedSlots }).catch(() => { })
      }
    }
  }

  const handleLoadState = async (save) => {
    if (!emulatorRef.current) {
      setSaveMessage('Start the game first before loading a save')
      setTimeout(() => setSaveMessage(''), 2000)
      return
    }

    let stateToLoad = save.stateData

    // If data isn't local, download it from cloud
    if (!stateToLoad && save.cloudUrl && isAuthenticated) {
      try {
        setDownloadingSave(save.id)
        setSaveMessage(`Downloading cloud save: ${save.name}...`)
        const downloadedData = await downloadSaveState(user.uid, currentGame.id, save.id)
        if (downloadedData) {
          stateToLoad = downloadedData
          // Cache locally
          const updatedSlots = saveSlots.map(s => 
            s.id === save.id ? { ...s, stateData: downloadedData } : s
          )
          setSaveSlots(updatedSlots)
          localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))
          setSaveMessage('Cloud save downloaded!')
        } else {
          throw new Error('Download returned empty data')
        }
      } catch (err) {
        console.error('Cloud download failed:', err)
        setSaveMessage('Failed to download cloud save')
        setTimeout(() => setSaveMessage(''), 3000)
        setDownloadingSave(null)
        return
      } finally {
        setDownloadingSave(null)
      }
    }

    if (!stateToLoad) {
      setSaveMessage('Save data not found (locally or in cloud)')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      const loaded = await emulatorRef.current.loadState(stateToLoad)
      if (loaded) {
        setSaveMessage(`Loaded: ${save.name || save.date}`)
      } else {
        setSaveMessage('Load failed — emulator may not support this. Try using in-game saves.')
      }
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (err) {
      console.error('Load state error:', err)
      setSaveMessage('Failed to load — the save may be corrupted or incompatible')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleDeleteSave = async (saveId) => {
    const updatedSlots = saveSlots.filter(s => s.id !== saveId)
    setSaveSlots(updatedSlots)
    localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))

    // Sync deletion to cloud (metadata + binary)
    if (isAuthenticated && user?.uid) {
      try {
        await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
        await deleteSaveState(user.uid, currentGame.id, saveId)
      } catch (err) {
        console.error('Cloud delete sync failed:', err)
      }
    }
  }

  const handleRenameSave = (saveId) => {
    const save = saveSlots.find(s => s.id === saveId)
    if (!save) return
    // Open themed modal for rename
    setSaveModalMode({ type: 'rename', saveId })
    setSaveModalDefault(save.name || `Save ${save.slot}`)
    setSaveModalOpen(true)
  }

  // Render stars
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= Math.round(rating) ? 'star--filled' : 'star--empty'}
        />
      )
    }
    return stars
  }

  return (
    <div className="player-page">
      {/* Breadcrumb */}
      <nav className="player-breadcrumb">
        <button onClick={() => navigate('home')}>Home</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate('library')}>Games</button>
        <ChevronRight size={14} />
        <span>{currentGame.title}</span>
      </nav>

      <div className="player-layout">
        {/* Main Content */}
        <div className="player-main">
          {/* Game Title & Actions */}
          <div className="player-header">
            <div className="player-header__left">
              <h1 className="player-title">{currentGame.title}</h1>
              <div className="player-rating">
                {renderStars(details.rating)}
                <span className="player-rating__value">{details.rating}</span>
              </div>
            </div>
            <div className="player-header__actions">
              {toggleFavorite && (
                <button
                  className={`player-action-btn ${isFavorite ? 'player-action-btn--active' : ''}`}
                  onClick={() => toggleFavorite(currentGame.id)}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>

          <div className="player-hero">
            <div className="player-meta-badges">
              <span className="player-badge player-badge--console">{currentGame.console}</span>
              <span className="player-badge player-badge--genre">{details.genre}</span>
              <span className="player-badge player-badge--difficulty">{details.difficulty}</span>
            </div>
            <p className="player-description">{details.description}</p>
          </div>

          {/* Emulator Frame */}
          <div className="player-emulator">
            <div className="player-emulator__label">
              <span className="player-emulator__label-text">Game Emulator</span>
              <div className="player-emulator__leds">
                <div className="player-led player-led--power"></div>
                <div className="player-led player-led--activity"></div>
              </div>
            </div>
            <div className="player-frame">
              {error ? (
                <div className="player-error">
                  <span>⚠️</span>
                  <p>{error}</p>
                  <button onClick={loadROM} className="btn btn--secondary">Retry</button>
                </div>
              ) : loading ? (
                <Loader text={`Loading ${currentGame.title}...`} />
              ) : (
                <canvas ref={canvasRef} className="player-canvas" />
              )}
            </div>

            {/* Save Bar - Only for games that support saves */}
            {supportsSaves && (
              <div className="player-saves-bar">
                <button
                  className={`player-save-btn ${saveSlots.length >= MAX_SAVE_SLOTS ? 'player-save-btn--maxed' : ''}`}
                  onClick={() => { setSaveModalMode('new'); setSaveModalDefault(''); setSaveModalOpen(true); }}
                  disabled={savingToCloud}
                >
                  <Save size={16} />
                  <span>{savingToCloud ? 'Saving...' : 'Save Game'}</span>
                  <span className="player-save-counter">{saveSlots.length}/{MAX_SAVE_SLOTS}</span>
                </button>
                {saveMessage && <span className="player-save-msg">{saveMessage}</span>}
                <div className="player-session">
                  <Clock size={14} />
                  <span>{formatTime(playtime)}</span>
                </div>
                <div className="player-cloud-status">
                  {isAuthenticated ? (
                    <><Cloud size={14} /> Cloud Active</>
                  ) : (
                    <><CloudOff size={14} /> Local Only</>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Soft & Sleek Game Overview Grid */}
          <section className="player-intel">
            <div className="player-intel-grid">
              {/* Specs Card */}
              <div className="intel-card">
                <div className="intel-card__header">
                  <div className="intel-card__icon">
                    <Cpu size={20} />
                  </div>
                  <h3 className="intel-card__title">System Specs</h3>
                </div>
                <div className="intel-stats">
                  <div className="intel-stat-item">
                    <span className="stat-label">Platform</span>
                    <span className="stat-value">{currentGame.console}</span>
                  </div>
                  <div className="intel-stat-item">
                    <span className="stat-label">Engine</span>
                    <span className="stat-value">
                      {currentGame.console === 'GBA' ? 'mGBA' : currentGame.console === 'NDS' ? 'DeSmuME' : 'RetroArch'}
                    </span>
                  </div>
                  <div className="intel-stat-item">
                    <span className="stat-label">Region</span>
                    <span className="stat-value">{details.region}</span>
                  </div>
                </div>
              </div>

              {/* Controls Card */}
              <div className="intel-card">
                <div className="intel-card__header">
                  <div className="intel-card__icon">
                    <Gamepad2 size={20} />
                  </div>
                  <h3 className="intel-card__title">Controls</h3>
                </div>
                <div className="intel-stats">
                  <div className="control-item">
                    <span className="stat-label">Movement</span>
                    <kbd className="control-key">←↑↓→</kbd>
                  </div>
                  <div className="control-item">
                    <span className="stat-label">Primary</span>
                    <kbd className="control-key">Z / X</kbd>
                  </div>
                  <div className="control-item">
                    <span className="stat-label">Select/Start</span>
                    <kbd className="control-key">Tab/Enter</kbd>
                  </div>
                </div>
              </div>

              {/* Performance/Sync Card */}
              <div className="intel-card">
                <div className="intel-card__header">
                  <div className="intel-card__icon">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="intel-card__title">Experience</h3>
                </div>
                <div className="intel-stats">
                  <div className="intel-stat-item">
                    <span className="stat-label">Playtime</span>
                    <span className="stat-value">{details.playtime}</span>
                  </div>
                  <div className="intel-stat-item">
                    <span className="stat-label">Cloud Sync</span>
                    <span className={`stat-value ${isAuthenticated ? 'text-green-400' : 'text-gray-500'}`}>
                      {isAuthenticated ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <div className="intel-stat-item">
                    <span className="stat-label">Difficulty</span>
                    <span className="stat-value">{details.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Save Slots — only for games that support saves */}
          {supportsSaves && (
            <section className="player-saves-section">
              <h2 className="player-section-title">
                Save States
                <span className="player-saves-count">{saveSlots.length} / {MAX_SAVE_SLOTS}</span>
              </h2>
              {!isAuthenticated ? (
                <div className="player-saves-empty">
                  <LogIn size={24} />
                  <p>Sign in to save your game progress and sync across devices.</p>
                </div>
              ) : saveSlots.length === 0 ? (
                <div className="player-saves-empty">
                  <div className="empty-icon-circle">
                    <Save size={24} />
                  </div>
                  <p>Your journey is just beginning. Save your progress anytime to resume later.</p>
                </div>
              ) : (
                <div className="player-save-slots">
                  {saveSlots.map(save => (
                    <div key={save.id} className={`player-save-slot ${downloadingSave === save.id ? 'player-save-slot--syncing' : ''}`}>
                      <div className="player-save-info">
                        <div className="save-name-wrap">
                          <span className="player-save-name">{save.name || `Save Slot ${save.slot}`}</span>
                          <div className="save-badges">
                            {save.cloudUrl && !save.stateData && <Cloud size={10} title="Cloud only" />}
                            {save.stateData && <HardDrive size={10} title="Local storage" />}
                          </div>
                        </div>
                        <div className="save-meta">
                          <span className="save-date">{save.date}</span>
                          <span className="save-dot">•</span>
                          <span className="save-time">{save.playtime}</span>
                        </div>
                      </div>
                      <div className="player-save-actions">
                        <button
                          className="save-action-icon"
                          onClick={() => handleRenameSave(save.id)}
                          title="Rename"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="save-action-primary"
                          onClick={() => handleLoadState(save)}
                          disabled={downloadingSave === save.id}
                        >
                          {downloadingSave === save.id ? (
                            <Loader size={14} />
                          ) : (
                            <>
                              <FolderOpen size={14} />
                              <span>{save.stateData ? 'Resume' : 'Sync'}</span>
                            </>
                          )}
                        </button>
                        <button
                          className="save-action-danger"
                          onClick={() => handleDeleteSave(save.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {saveSlots.length >= MAX_SAVE_SLOTS && (
                <div className="player-saves-warning">
                  <AlertTriangle size={14} />
                  <span>Maximum saves reached. Delete a save to create a new one.</span>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="player-sidebar">
          {/* Game Cover */}
          <div className="player-cover">
            <div className="player-cover__image">
              <img
                src={currentGame.thumbnail || '/thumbnails/default-cover.svg'}
                alt={currentGame.title}
                className="player-cover__img"
                onError={(e) => { e.target.src = '/thumbnails/default-cover.svg' }}
              />
            </div>
            <div className="player-cover__info">
              <div className="player-cover__row">
                <Calendar size={14} />
                <span>Release: {currentGame.year}</span>
              </div>
              <div className="player-cover__row">
                <MapPin size={14} />
                <span>Region: {details.region}</span>
              </div>
              <div className="player-cover__row">
                <Gamepad2 size={14} />
                <span>Platform: {currentGame.console}</span>
              </div>
            </div>
          </div>

          {/* Similar Games */}
          {similarGames.length > 0 && (
            <div className="player-similar">
              <h3 className="player-similar__title">Similar Games</h3>
              <div className="player-similar__list">
                {similarGames.map(g => (
                  <button
                    key={g.id}
                    className="player-similar__item"
                    onClick={() => onPlayGame && onPlayGame(g)}
                  >
                    <img
                      src={g.thumbnail || '/thumbnails/default-cover.svg'}
                      alt={g.title}
                      className="player-similar__thumb"
                      onError={(e) => { e.target.src = '/thumbnails/default-cover.svg' }}
                    />
                    <div className="player-similar__info">
                      <span className="player-similar__name">{g.title}</span>
                      <span className="player-similar__year">{g.year}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <button className="player-back-btn" onClick={() => navigate('library')}>
            ← Back to Games
          </button>
        </aside>
      </div>

      {/* Save Name Modal */}
      <SaveNameModal
        isOpen={saveModalOpen}
        defaultName={saveModalDefault}
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveModalOpen(false)}
      />
    </div>
  )
}

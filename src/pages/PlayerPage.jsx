import React, { useState, useRef, useEffect, useCallback } from 'react'
import GBAEmulator from '../lib/gba-emulator'
import { Loader } from '../components/Loader'
import SaveNameModal from '../components/SaveNameModal'
import { games } from '../data/games'
import { useAuth } from '../context/AuthContext'
import { saveGameState, loadGameState } from '../lib/cloudSaves'
import { onPlayTimeRecorded } from '../lib/xpEngine'
import { sanitizeSaveName } from '../lib/inputSanitizer'
import {
  Save, FolderOpen, Trash2, ChevronRight, Star, Clock,
  Gamepad2, Calendar, MapPin, Zap, Heart, Play, Volume2, Cloud, CloudOff, AlertTriangle, Edit3, LogIn
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
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const emulatorRef = useRef(null)
  const { user, isAuthenticated } = useAuth()

  const MAX_SAVE_SLOTS = 5

  // Arcade/simple games don't support save states
  const ARCADE_GENRES = ['Arcade', 'Puzzle']
  const supportsSaves = currentGame.romPath && !ARCADE_GENRES.includes(details.genre)

  const isFavorite = favorites?.includes(currentGame.id)

  // Get similar games (same console or genre)
  const similarGames = games.filter(g =>
    g.id !== currentGame.id &&
    (g.console === currentGame.console ||
      g.genre === details.genre)
  ).slice(0, 4)

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
                  stateData: local?.stateData || null // Preserve local stateData
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
    if (emulatorRef.current) {
      emulatorRef.current.destroy()
      emulatorRef.current = null
      setRomData(null)
    }

    if (currentGame.romPath) {
      loadROM()
      intervalRef.current = setInterval(() => setPlaytime(t => t + 1), 1000)
    } else {
      setLoading(false)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (emulatorRef.current) {
        emulatorRef.current.destroy()
        emulatorRef.current = null
      }
      const gameDiv = document.getElementById('game')
      if (gameDiv) gameDiv.remove()
    }
  }, [currentGame.romPath, loadROM])

  // Initialize emulator after ROM loads
  useEffect(() => {
    if (romData && canvasRef.current && !emulatorRef.current) {
      try {
        let system = 'gba'
        if (currentGame.console === 'NES') system = 'nes'
        if (currentGame.console === 'SegaCD') system = 'segaCD'
        if (currentGame.console === 'NDS') system = 'nds'

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

        // Sync metadata to cloud
        if (isAuthenticated && user?.uid) {
          try {
            await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
            setSaveMessage('Saved to cloud! ☁️')
          } catch (err) {
            console.error('Cloud save failed:', err)
            setSaveMessage('Saved locally (cloud sync failed)')
          }
        }
        setTimeout(() => setSaveMessage(''), 2000)
      } catch (error) {
        console.error('Save state error:', error)
        setSaveMessage('Save failed — emulator may not support saves for this game')
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
    if (!save.stateData) {
      setSaveMessage('Save data is only available locally — it can\'t be loaded from cloud alone')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }
    try {
      const loaded = await emulatorRef.current.loadState(save.stateData)
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

    // Sync deletion to cloud
    if (isAuthenticated && user?.uid) {
      try {
        await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
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

          <p className="player-description">{details.description}</p>

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

            {/* Save States Bar — only for games that support saves */}
            {supportsSaves && (
              <div className="player-saves-bar">
                <button
                  className={`player-save-btn ${saveSlots.length >= MAX_SAVE_SLOTS ? 'player-save-btn--maxed' : ''}`}
                  onClick={handleSaveState}
                  disabled={savingToCloud}
                >
                  <Save size={16} />
                  <span>{savingToCloud ? 'Saving...' : 'Save Game'}</span>
                  <span className="player-save-counter">{saveSlots.length}/{MAX_SAVE_SLOTS}</span>
                </button>
                {saveMessage && <span className="player-save-msg">{saveMessage}</span>}
                <span className="player-session">
                  <Clock size={14} />
                  {formatTime(playtime)}
                </span>
                <span className="player-cloud-status">
                  {isAuthenticated ? (
                    <><Cloud size={14} /> Cloud</>
                  ) : (
                    <><CloudOff size={14} /> Local</>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Game Details Section */}
          <section className="player-details">
            <h2 className="player-section-title">Game Details</h2>

            <div className="player-details-grid">
              <div className="player-info-card">
                <h3>Basic Information</h3>
                <dl className="player-info-list">
                  <div><dt>Developer</dt><dd>{details.developer}</dd></div>
                  <div><dt>Release Year</dt><dd>{currentGame.year}</dd></div>
                  <div><dt>Platform</dt><dd>{currentGame.console}</dd></div>
                  <div><dt>Region</dt><dd>{details.region}</dd></div>
                  <div><dt>Genre</dt><dd>{details.genre}</dd></div>
                  <div><dt>Difficulty</dt><dd>{details.difficulty}</dd></div>
                  <div><dt>Play Time</dt><dd>{details.playtime}</dd></div>
                </dl>
              </div>

              <div className="player-info-card">
                <h3>Game Features</h3>
                <ul className="player-features-list">
                  {details.features?.map((feature, i) => (
                    <li key={i}>
                      <Zap size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="player-controls-section">
            <h2 className="player-section-title">Controls</h2>
            <div className="player-controls-grid">
              <div className="player-control"><kbd>Arrow Keys</kbd><span>D-Pad</span></div>
              <div className="player-control"><kbd>X</kbd><span>A Button</span></div>
              <div className="player-control"><kbd>Z</kbd><span>B Button</span></div>
              <div className="player-control"><kbd>Enter</kbd><span>Start</span></div>
              <div className="player-control"><kbd>Shift</kbd><span>Select</span></div>
              <div className="player-control"><kbd>A / S</kbd><span>L / R</span></div>
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
                  <Save size={24} />
                  <p>No saves yet. Click <strong>Save Game</strong> above after playing to create a save state.</p>
                </div>
              ) : (
                <div className="player-save-slots">
                  {saveSlots.map(save => (
                    <div key={save.id} className="player-save-slot">
                      <div className="player-save-info">
                        <span className="player-save-name">{save.name || `Save ${save.slot}`}</span>
                        <span className="player-save-date">{save.date}</span>
                        <span className="player-save-time">{save.playtime}</span>
                        {!save.stateData && <span className="player-save-cloud-only">metadata only</span>}
                      </div>
                      <div className="player-save-actions">
                        <button
                          className="player-save-rename"
                          onClick={() => handleRenameSave(save.id)}
                          title="Rename save"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="player-save-load"
                          onClick={() => handleLoadState(save)}
                          title="Load this save"
                          disabled={!save.stateData}
                        >
                          <FolderOpen size={14} />
                          <span>Load</span>
                        </button>
                        <button
                          className="player-save-delete"
                          onClick={() => handleDeleteSave(save.id)}
                          title="Delete this save"
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

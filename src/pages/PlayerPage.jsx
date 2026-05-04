import React, { useState, useRef, useEffect, useCallback } from 'react'
import GBAEmulator from '../lib/gba-emulator'
import { Loader } from '../components/Loader'
import SaveNameModal from '../components/SaveNameModal'
import { games } from '../data/games'
import { useAuth } from '../context/AuthContext'
import { saveGameState, getGameSaveMetadata, downloadSaveState, deleteSaveState } from '../lib/cloudSaves'
import { onPlayTimeRecorded } from '../lib/xpEngine'
import { sanitizeSaveName } from '../lib/inputSanitizer'
import {
  Save, FolderOpen, Trash2, ChevronRight, Star, Clock, RefreshCw,
  Gamepad2, Calendar, MapPin, Zap, Heart, Play, Volume2, Cloud, CloudOff, AlertTriangle, Edit3, LogIn,
  Cpu, ShieldCheck, Info, HardDrive, BookOpen, Trophy
} from 'lucide-react'
import ShinyText from '../components/ShinyText'
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
  const playtimeRef = useRef(0)
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
          const cloudData = await getGameSaveMetadata(user.uid, currentGame.id)
          if (cloudData?.slots) {
            // Merge cloud metadata with local stateData
            setSaveSlots(prev => {
              const localSlots = [...prev]
              const cloudSlots = cloudData.slots

              // Create a map for quick lookup
              const merged = [...cloudSlots]
              
              // Add local slots that aren't in the cloud yet
              localSlots.forEach(ls => {
                const cloudIndex = merged.findIndex(cs => cs.id === ls.id)
                if (cloudIndex !== -1) {
                   // Update cloud metadata with local stateData if available
                   merged[cloudIndex] = { ...merged[cloudIndex], stateData: ls.stateData || merged[cloudIndex].stateData || null }
                } else {
                   // Keep local only slot
                   merged.push(ls)
                }
              })
              
              return merged.sort((a, b) => (b.id || 0) - (a.id || 0)) // Sort by newest
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
      window.scrollTo(0, 0)
      // Small delay to let page transition finish smoothly
      timeoutId = setTimeout(() => {
        loadROM()
      }, 150)
      intervalRef.current = setInterval(() => {
        setPlaytime(t => {
          const next = t + 1
          playtimeRef.current = next
          return next
        })
      }, 1000)
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
      
      if (playtimeRef.current > 0 && setXpData) {
        setXpData(prev => onPlayTimeRecorded(prev, playtimeRef.current / 60))
      }
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
        setSaveMessage('Capturing game state...')
        console.log('[SaveFlow] Step 1: Capturing emulator state...')
        const stateData = await emulatorRef.current.saveState()
        console.log('[SaveFlow] Step 2: Got stateData, type:', typeof stateData, 'length:', stateData?.length || stateData?.byteLength || 'unknown')

        // CRITICAL: If emulator returned null, don't create a broken save
        if (!stateData) {
          setSaveMessage('Could not capture game state — try playing for a few more seconds first')
          setTimeout(() => setSaveMessage(''), 4000)
          setSavingToCloud(false)
          return
        }

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

        // Try localStorage, but don't fail if quota exceeded (base64 saves can be large)
        try {
          localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))
          console.log('[SaveFlow] Step 3: Saved locally. isAuthenticated:', isAuthenticated, 'uid:', user?.uid)
        } catch (storageErr) {
          console.warn('[SaveFlow] localStorage full, saving metadata only:', storageErr.name)
          // Save just metadata without binary data
          const metaOnly = updatedSlots.map(s => ({ ...s, stateData: null }))
          try { localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaOnly)) } catch { /* ignore */ }
        }

        // Sync metadata and binary to cloud
        if (isAuthenticated && user?.uid) {
          try {
            setSaveMessage('Uploading to cloud...')
            console.log('[SaveFlow] Step 4: Calling saveGameState for cloud sync...')
            const cloudSlots = await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
            console.log('[SaveFlow] Step 5: Cloud response:', cloudSlots ? `${cloudSlots.length} slots` : 'null')
            if (cloudSlots) {
              // After cloud upload, update local cache with cloudUrl and drop heavy binary
              const mergedSlots = cloudSlots.map(cs => {
                const local = updatedSlots.find(l => l.id === cs.id)
                return { ...cs, stateData: local?.stateData || null }
              })
              setSaveSlots(mergedSlots)
              // Also update localStorage with cloudUrl metadata (without binary to save space)
              const metaForStorage = mergedSlots.map(s => ({ ...s, stateData: null }))
              try { localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaForStorage)) } catch { /* ignore */ }
            }
            setSaveMessage('Saved to cloud! ☁️')
          } catch (err) {
            console.error('[SaveFlow] ❌ Cloud save failed:', err.code, err.message, err)
            setSaveMessage('Saved locally (cloud sync failed: ' + (err.message || 'unknown error') + ')')
          }
        } else {
          setSaveMessage('Saved locally')
        }
        setTimeout(() => setSaveMessage(''), 4000)
      } catch (error) {
        console.error('[SaveFlow] ❌ Save state error:', error)
        if (error.code === 'resource-exhausted' || error.message?.includes('size')) {
           setSaveMessage('Saved locally (Save file too large for cloud sync)')
        } else {
           setSaveMessage('Save failed — try again after the game loads fully')
        }
        setTimeout(() => setSaveMessage(''), 4000)
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
          setTimeout(() => setSaveMessage(''), 2000)
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

    // Now check if we can actually load it into the emulator
    if (!emulatorRef.current) {
      setSaveMessage('Start the game first before loading a save')
      setTimeout(() => setSaveMessage(''), 3000)
      return
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

  const handleOverwriteSave = async (saveId) => {
    if (!emulatorRef.current) {
      setSaveMessage('Start the game first before overwriting')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      setSavingToCloud(true)
      setSaveMessage('Overwriting save...')
      const stateData = await emulatorRef.current.saveState()

      if (!stateData) {
        setSaveMessage('Could not capture game state — try again')
        setTimeout(() => setSaveMessage(''), 3000)
        setSavingToCloud(false)
        return
      }

      const updatedSlots = saveSlots.map(s =>
        s.id === saveId
          ? { ...s, stateData, date: new Date().toLocaleString(), playtime: formatTime(playtime), cloudUrl: null }
          : s
      )
      setSaveSlots(updatedSlots)

      try {
        localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))
      } catch {
        const metaOnly = updatedSlots.map(s => ({ ...s, stateData: null }))
        try { localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaOnly)) } catch { /* ignore */ }
      }

      // Re-upload to cloud
      if (isAuthenticated && user?.uid) {
        try {
          const cloudSlots = await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
          if (cloudSlots) {
            const mergedSlots = cloudSlots.map(cs => {
              const local = updatedSlots.find(l => l.id === cs.id)
              return { ...cs, stateData: local?.stateData || null }
            })
            setSaveSlots(mergedSlots)
            const metaForStorage = mergedSlots.map(s => ({ ...s, stateData: null }))
            try { localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaForStorage)) } catch { /* ignore */ }
          }
          setSaveMessage('Save overwritten! ☁️')
        } catch (err) {
          console.error('Cloud overwrite failed:', err)
          setSaveMessage('Overwritten locally (cloud sync failed)')
        }
      } else {
        setSaveMessage('Save overwritten locally')
      }
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Overwrite error:', error)
      setSaveMessage('Overwrite failed')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSavingToCloud(false)
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
              <h1 className="player-title">
                <ShinyText
                  text={currentGame.title}
                  speed={3}
                  color="#ffffff"
                  shineColor="#8b5cf6"
                />
              </h1>
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

          {/* Emulator Frame - V3 Cinematic */}
          <div className="player-emulator">
            <div className="player-emulator__label">
              <span className="player-emulator__label-text">Neural Link Active</span>
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
                <Loader text={`Syncing ${currentGame.title}...`} />
              ) : (
                <canvas ref={canvasRef} className="player-canvas" />
              )}
            </div>
          </div>

          {/* Neural Link - V3 Cinematic Bar */}
          {supportsSaves && (
            <div className="v3-operational-bar">
              <div className="v3-bar-group">
                <div className="v3-bar-pill">
                  <Clock size={14} className="v3-icon-violet" />
                  <span className="v3-bar-value">{formatTime(playtime)}</span>
                </div>
                <div className="v3-bar-pill">
                  {isAuthenticated ? <Cloud size={14} className="v3-icon-blue" /> : <CloudOff size={14} className="v3-icon-gray" />}
                  <span className="v3-bar-label">{isAuthenticated ? 'Cluster Sync' : 'Local Node'}</span>
                </div>
              </div>
              
              <button 
                className="v3-save-button" 
                onClick={() => { setSaveModalMode('new'); setSaveModalDefault(''); setSaveModalOpen(true); }}
                disabled={savingToCloud}
              >
                <Save size={16} />
                <span>{savingToCloud ? 'Saving...' : 'Save Game'}</span>
                <span className="v3-save-counter">{saveSlots.length}/{MAX_SAVE_SLOTS}</span>
              </button>
            </div>
          )}

          <div className="player-editorial-grid">
            {/* Chronicle Lore */}
            <div className="editorial-card editorial-card--lore">
              <div className="editorial-header">
                <div className="editorial-icon"><BookOpen size={16} /></div>
                <h3>Chronicle Lore</h3>
              </div>
              <div className="lore-content">
                <p className="player-description">{details.description}</p>
              </div>
            </div>

            {/* Operational DNA */}
            <div className="editorial-card editorial-card--dna">
              <div className="editorial-header">
                <div className="editorial-icon"><Zap size={16} /></div>
                <h3>Operational DNA</h3>
              </div>
              <div className="dna-grid">
                <div className="dna-item">
                  <span className="dna-label">Platform Architecture</span>
                  <span className="dna-value">{currentGame.console}</span>
                </div>
                <div className="dna-item">
                  <span className="dna-label">System Region</span>
                  <span className="dna-value">{details.region}</span>
                </div>
                <div className="dna-item">
                  <span className="dna-label">Deployment Era</span>
                  <span className="dna-value">{currentGame.year}</span>
                </div>
                <div className="dna-item">
                  <span className="dna-label">Operational Complexity</span>
                  <span className="dna-value">{details.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence Matrix - Final Integration */}
          <section className="intelligence-matrix">
            <div className="matrix-grid">
              <div className="matrix-item">
                <Gamepad2 size={20} className="matrix-icon" />
                <div className="matrix-info">
                  <h4>Control Interface</h4>
                  <p>Primary: Z / X • Movement: Arrows</p>
                </div>
              </div>
              <div className="matrix-item">
                <ShieldCheck size={20} className="matrix-icon" />
                <div className="matrix-info">
                  <h4>Integrity Status</h4>
                  <p>{isAuthenticated ? 'Cluster Verified' : 'Local Sandbox'}</p>
                </div>
              </div>
              <div className="matrix-item">
                <Trophy size={20} className="matrix-icon" />
                <div className="matrix-info">
                  <h4>Accumulated Time</h4>
                  <p>{details.playtime}</p>
                </div>
              </div>
            </div>
          </section>


          {/* Save Slots — only for games that support saves */}
          {supportsSaves && (
            <div className="player-editorial player-saves-section">
              <div className="editorial-card editorial-card--saves">
                <div className="editorial-header">
                  <div className="editorial-icon"><Save size={16} /></div>
                  <div className="editorial-header__flex">
                    <h3>Chronicle Manifest</h3>
                    <span className="player-saves-count">{saveSlots.length} / {MAX_SAVE_SLOTS}</span>
                  </div>
                  {saveMessage && (
                    <div className="save-status-toast">
                      <Zap size={12} className="animate-pulse" />
                      <span>{saveMessage}</span>
                    </div>
                  )}
                </div>

                {!isAuthenticated ? (
                  <div className="player-saves-empty">
                    <LogIn size={20} />
                    <p>Authentication required to sync chronologies across the cluster.</p>
                  </div>
                ) : saveSlots.length === 0 ? (
                  <div className="player-saves-empty">
                    <div className="empty-icon-circle">
                      <HardDrive size={20} />
                    </div>
                    <p>No save manifests detected. Begin your journey to initialize a new state.</p>
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
                          className="save-action-icon save-action-overwrite"
                          onClick={() => handleOverwriteSave(save.id)}
                          title="Overwrite with current progress"
                          disabled={savingToCloud}
                        >
                          <RefreshCw size={14} />
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
            </div>
          </div>
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

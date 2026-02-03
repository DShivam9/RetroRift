import React, { useState, useRef, useEffect, useCallback } from 'react'
import GBAEmulator from '../lib/gba-emulator'
import { Loader } from '../components/Loader'
import { games } from '../data/games'
import {
  Save, FolderOpen, Trash2, ChevronRight, Star, Clock,
  Gamepad2, Calendar, MapPin, Zap, Heart, Play, Volume2
} from 'lucide-react'
import '../styles/components.css'
import './PlayerPage.css'

// Enhanced game details with more info
const GAME_DETAILS = {
  'Pokemon FireRed': {
    description: 'Return to the Kanto region! Choose your starter and embark on an epic journey to become the Pokemon Champion.',
    region: 'Kanto',
    genre: 'RPG',
    developer: 'Game Freak',
    difficulty: 'Medium',
    playtime: '25-40 hours',
    rating: 4.8,
    features: ['151 Original Pokémon', 'Wireless Trading', 'Post-game Content', 'New Islands']
  },
  'Pokemon Ruby': {
    description: 'Explore the tropical Hoenn region and stop Team Magma from awakening Groudon.',
    region: 'Hoenn',
    genre: 'RPG',
    developer: 'Game Freak',
    difficulty: 'Medium',
    playtime: '30-45 hours',
    rating: 4.7,
    features: ['135 New Pokémon', 'Double Battles', 'Contests', 'Secret Bases']
  },
  'Pokemon Sapphire': {
    description: 'Dive into Hoenn and counter Team Aqua as they try to awaken Kyogre.',
    region: 'Hoenn',
    genre: 'RPG',
    developer: 'Game Freak',
    difficulty: 'Medium',
    playtime: '30-45 hours',
    rating: 4.7,
    features: ['135 New Pokémon', 'Diving Mechanic', 'Contests', 'Team Aqua Story']
  },
  'Pokemon Emerald': {
    description: 'The definitive Hoenn experience with both Team Magma and Aqua, plus the Battle Frontier.',
    region: 'Hoenn',
    genre: 'RPG',
    developer: 'Game Freak',
    difficulty: 'Medium-Hard',
    playtime: '40-60 hours',
    rating: 4.9,
    features: ['Battle Frontier', 'Both Teams', 'Rayquaza Story', 'Animated Sprites']
  },
  'Mario Kart: Super Circuit': {
    description: 'Race as Mario and friends across 40 tracks in this portable racing classic.',
    region: 'Mushroom Kingdom',
    genre: 'Racing',
    developer: 'Intelligent Systems',
    difficulty: 'Easy-Medium',
    playtime: '10-20 hours',
    rating: 4.5,
    features: ['40 Tracks', '8 Characters', 'Grand Prix Mode', 'Link Cable Multiplayer']
  },
  'Pac-Man': {
    description: 'Navigate the maze, eat pellets, and avoid ghosts in this arcade legend.',
    region: 'Arcade',
    genre: 'Arcade',
    developer: 'Namco',
    difficulty: 'Easy',
    playtime: 'Endless',
    rating: 4.6,
    features: ['Classic Gameplay', 'Power Pellets', '4 Ghost Types', 'High Score Chase']
  },
  'Sonic 3D Blast': {
    description: 'Guide Sonic through isometric 3D environments to rescue Flickies.',
    region: 'Green Grove',
    genre: 'Platformer',
    developer: "Traveller's Tales",
    difficulty: 'Medium',
    playtime: '5-8 hours',
    rating: 3.8,
    features: ['Isometric View', '7 Zones', 'Chaos Emeralds', 'Special Stages']
  },
  'Pokemon Platinum': {
    description: 'Explore Sinnoh and enter the Distortion World in this enhanced adventure.',
    region: 'Sinnoh',
    genre: 'RPG',
    developer: 'Game Freak',
    difficulty: 'Medium',
    playtime: '35-50 hours',
    rating: 4.8,
    features: ['Distortion World', 'Battle Frontier', 'Wi-Fi Plaza', 'Giratina Origin']
  }
}

/**
 * PlayerPage - Enhanced Emulator Page
 */
export default function PlayerPage({ navigate, game, favorites = [], toggleFavorite, onPlayGame }) {
  const currentGame = game || { title: 'Select a Game', console: 'N/A', year: '----', romPath: null }
  const details = GAME_DETAILS[currentGame.title] || {
    description: 'A classic gaming experience.',
    region: 'Unknown',
    genre: 'Game',
    developer: 'Unknown',
    difficulty: 'Unknown',
    playtime: 'Varies',
    rating: 4.0,
    features: []
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playtime, setPlaytime] = useState(0)
  const [romData, setRomData] = useState(null)
  const [saveSlots, setSaveSlots] = useState([])
  const [saveMessage, setSaveMessage] = useState('')
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const emulatorRef = useRef(null)

  const isFavorite = favorites?.includes(currentGame.id)

  // Get similar games (same console or genre)
  const similarGames = games.filter(g =>
    g.id !== currentGame.id &&
    (g.console === currentGame.console ||
      GAME_DETAILS[g.title]?.genre === details.genre)
  ).slice(0, 4)

  // Load existing save slots for this game
  useEffect(() => {
    if (currentGame.id) {
      const saved = localStorage.getItem(`saves_${currentGame.id}`)
      if (saved) setSaveSlots(JSON.parse(saved))
    }
  }, [currentGame.id])

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

  // Save state handlers
  const handleSaveState = async () => {
    if (!emulatorRef.current) {
      setSaveMessage('Emulator not ready')
      setTimeout(() => setSaveMessage(''), 2000)
      return
    }

    try {
      const stateData = await emulatorRef.current.saveState()
      const newSave = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        playtime: formatTime(playtime),
        slot: saveSlots.length + 1,
        stateData: stateData
      }
      const updatedSlots = [...saveSlots, newSave].slice(-5)
      setSaveSlots(updatedSlots)
      localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))
      setSaveMessage('State saved!')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (error) {
      setSaveMessage('Failed to save state')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  const handleLoadState = async (save) => {
    if (!emulatorRef.current) return
    try {
      if (save.stateData) {
        await emulatorRef.current.loadState(save.stateData)
        setSaveMessage(`Loaded save from ${save.date}`)
      } else {
        setSaveMessage('No state data')
      }
      setTimeout(() => setSaveMessage(''), 2000)
    } catch {
      setSaveMessage('Failed to load')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  const handleDeleteSave = (saveId) => {
    const updatedSlots = saveSlots.filter(s => s.id !== saveId)
    setSaveSlots(updatedSlots)
    localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))
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

            {/* Save States Bar */}
            {currentGame.romPath && (
              <div className="player-saves-bar">
                <button className="player-quick-save" onClick={handleSaveState}>
                  <Save size={16} />
                  Quick Save
                </button>
                {saveMessage && <span className="player-save-msg">{saveMessage}</span>}
                <span className="player-session">
                  <Clock size={14} />
                  {formatTime(playtime)}
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

          {/* Save Slots */}
          {saveSlots.length > 0 && (
            <section className="player-saves-section">
              <h2 className="player-section-title">Save States</h2>
              <div className="player-save-slots">
                {saveSlots.map(save => (
                  <div key={save.id} className="player-save-slot">
                    <div className="player-save-info">
                      <span className="player-save-num">Slot {save.slot}</span>
                      <span className="player-save-date">{save.date}</span>
                      <span className="player-save-time">{save.playtime}</span>
                    </div>
                    <div className="player-save-actions">
                      <button onClick={() => handleLoadState(save)}><FolderOpen size={14} /></button>
                      <button onClick={() => handleDeleteSave(save.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="player-sidebar">
          {/* Game Cover */}
          <div className="player-cover">
            <div className="player-cover__image">
              <span className="player-cover__emoji">{currentGame.thumbnail || '🎮'}</span>
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
                    <span className="player-similar__emoji">{g.thumbnail}</span>
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
    </div>
  )
}

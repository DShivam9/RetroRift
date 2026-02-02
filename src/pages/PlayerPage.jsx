import React, { useState, useRef, useEffect, useCallback } from 'react'
import GBAEmulator from '../lib/gba-emulator'
import { Loader } from '../components/Loader'
import '../styles/components.css'
import './PlayerPage.css'

// Game details for display
const GAME_DETAILS = {
  'Pokemon FireRed': {
    description: 'Return to the Kanto region! Choose your starter and embark on an epic journey to become the Pokemon Champion.',
    region: 'Kanto',
    genre: 'RPG',
    developer: 'Game Freak'
  },
  'Pokemon Ruby': {
    description: 'Explore the tropical Hoenn region and stop Team Magma from awakening Groudon.',
    region: 'Hoenn',
    genre: 'RPG',
    developer: 'Game Freak'
  },
  'Pokemon Sapphire': {
    description: 'Dive into Hoenn and counter Team Aqua as they try to awaken Kyogre.',
    region: 'Hoenn',
    genre: 'RPG',
    developer: 'Game Freak'
  },
  'Pokemon Emerald': {
    description: 'The definitive Hoenn experience with both Team Magma and Aqua, plus the Battle Frontier.',
    region: 'Hoenn',
    genre: 'RPG',
    developer: 'Game Freak'
  },
  'Mario Kart: Super Circuit': {
    description: 'Race as Mario and friends across 40 tracks in this portable racing classic.',
    region: 'Mushroom Kingdom',
    genre: 'Racing',
    developer: 'Intelligent Systems'
  },
  'Pac-Man': {
    description: 'Navigate the maze, eat pellets, and avoid ghosts in this arcade legend.',
    region: 'Arcade',
    genre: 'Arcade',
    developer: 'Namco'
  },
  'Sonic 3D Blast': {
    description: 'Guide Sonic through isometric 3D environments to rescue Flickies.',
    region: 'Green Grove',
    genre: 'Platformer',
    developer: "Traveller's Tales"
  },
  'Pokemon Platinum': {
    description: 'Explore Sinnoh and enter the Distortion World in this enhanced adventure.',
    region: 'Sinnoh',
    genre: 'RPG',
    developer: 'Game Freak'
  }
}

/**
 * PlayerPage - Emulator display (emulator logic untouched)
 */
export default function PlayerPage({ navigate, game }) {
  const currentGame = game || { title: 'Select a Game', console: 'N/A', year: '----', romPath: null }
  const details = GAME_DETAILS[currentGame.title] || { description: 'A classic gaming experience.', region: 'Unknown', genre: 'Game', developer: 'Unknown' }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playtime, setPlaytime] = useState(0)
  const [romData, setRomData] = useState(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const emulatorRef = useRef(null)

  // Load ROM (memoized)
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

  return (
    <div className="player">
      <div className="player__container">
        {/* Back Button */}
        <button
          onClick={() => navigate('library')}
          className="player__back"
        >
          ← Back to Library
        </button>

        {/* Title */}
        <h1 className="player__title">{currentGame.title}</h1>

        {/* Emulator Frame */}
        <div className="player__frame">
          {error ? (
            <div className="player__error">
              <span className="player__error-icon">⚠️</span>
              <p className="player__error-text">{error}</p>
              <button onClick={loadROM} className="btn btn--secondary">
                Retry
              </button>
            </div>
          ) : loading ? (
            <Loader text={`Loading ${currentGame.title}...`} />
          ) : (
            <canvas
              ref={canvasRef}
              className="player__canvas"
            />
          )}
        </div>

        {/* Game Info */}
        <div className="player__info">
          <div className="player__meta">
            <div className="player__meta-item">
              <span className="player__meta-label">Platform</span>
              <span className="player__meta-value">{currentGame.console}</span>
            </div>
            <div className="player__meta-item">
              <span className="player__meta-label">Year</span>
              <span className="player__meta-value">{currentGame.year}</span>
            </div>
            <div className="player__meta-item">
              <span className="player__meta-label">Session</span>
              <span className="player__meta-value">{formatTime(playtime)}</span>
            </div>
          </div>

          <div className="player__description">
            <h3>About</h3>
            <p>{details.description}</p>
          </div>

          <div className="player__controls">
            <h3>Controls</h3>
            <div className="player__controls-grid">
              <div className="player__control">
                <kbd>Arrow Keys</kbd>
                <span>D-Pad</span>
              </div>
              <div className="player__control">
                <kbd>X</kbd>
                <span>A Button</span>
              </div>
              <div className="player__control">
                <kbd>Z</kbd>
                <span>B Button</span>
              </div>
              <div className="player__control">
                <kbd>Enter</kbd>
                <span>Start</span>
              </div>
              <div className="player__control">
                <kbd>Shift</kbd>
                <span>Select</span>
              </div>
              <div className="player__control">
                <kbd>A / S</kbd>
                <span>L / R</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

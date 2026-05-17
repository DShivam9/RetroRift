import React, { useState, useEffect, useRef } from 'react'
import './VerticalGameTicker.css'

export default function VerticalGameTicker({ games, activeGame, setActiveGame, onPlayGame }) {
  const [isPaused, setIsPaused] = useState(false)
  const currentIndexRef = useRef(0)
  
  // Stable cycle duration (seconds per game)
  const CYCLE_SPEED = 2.5 
  const totalDuration = games.length * CYCLE_SPEED

  useEffect(() => {
    if (games.length === 0) return

    // Find the starting index if activeGame is already set
    const startIdx = games.findIndex(g => g.id === activeGame?.id)
    currentIndexRef.current = startIdx >= 0 ? startIdx : 0

    const interval = setInterval(() => {
      if (!isPaused) {
        currentIndexRef.current = (currentIndexRef.current + 1) % games.length
        const nextGame = games[currentIndexRef.current]
        setActiveGame(nextGame)
      }
    }, CYCLE_SPEED * 1000)

    return () => clearInterval(interval)
  }, [games, isPaused, setActiveGame])

  if (!games || games.length === 0) return null

  // Double the list for seamless CSS loop
  const displayGames = [...games, ...games]

  return (
    <div 
      className="v-ticker-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="v-ticker-header">FEATURED TITLES</div>
      
      <div className="v-ticker-container">
        <div 
          className="v-ticker-track-css"
          style={{ 
            animationDuration: `${totalDuration}s`,
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        >
          {displayGames.map((game, i) => (
            <div 
              key={`${game.id}-${i}`}
              className={`v-ticker-item-css ${activeGame?.id === game.id ? 'active' : ''}`}
              onClick={() => onPlayGame(game)}
            >
              <span className="v-ticker-console">{game.console}</span>
              <span className="v-ticker-title">{game.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

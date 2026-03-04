import React, { memo, useState, useRef, useCallback } from 'react'
import { Heart, Play, Gamepad2 } from 'lucide-react'
import GameBadge from './GameBadge'
import './GameCard.css'

/**
 * GameCard — Clean hover with scale, glow border, and info slide-up
 * Removed broken parallax. Kept glass panel reveal.
 */
const GameCard = memo(function GameCard({
  game,
  navigate,
  isFavorite,
  toggleFavorite,
  onPlay,
  badge
}) {
  const [heartPop, setHeartPop] = useState(false)
  const cardRef = useRef(null)

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setHeartPop(true)
    setTimeout(() => setHeartPop(false), 600)
    toggleFavorite?.(game.id)
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    onPlay ? onPlay(game) : navigate('player')
  }

  return (
    <article
      ref={cardRef}
      className="game-card"
      onClick={handlePlay}
    >
      {/* Gradient border glow */}
      <div className="game-card__border" />

      {/* Main content */}
      <div className="game-card__content">
        <img
          src={game.thumbnail || '/thumbnails/default-cover.svg'}
          alt={game.title}
          className="game-card__image"
          loading="lazy"
          onError={(e) => { e.target.src = '/thumbnails/default-cover.svg' }}
        />
        <div className="game-card__overlay" />

        {/* Badge */}
        {badge && (
          <div className="game-card__badge-wrap">
            <GameBadge type={badge} />
          </div>
        )}

        {/* Console tag */}
        <div className="game-card__console-tag">
          <Gamepad2 size={11} />
          <span>{game.console}</span>
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className={`game-card__fav ${isFavorite ? 'game-card__fav--active' : ''} ${heartPop ? 'game-card__fav--pop' : ''}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className="game-card__fav-icon"
            size={16}
            fill={isFavorite ? 'currentColor' : 'none'}
            strokeWidth={2.5}
          />
        </button>

        {/* Info panel — slides up on hover */}
        <div className="game-card__panel">
          <h3 className="game-card__title">{game.title}</h3>
          <div className="game-card__meta">
            <span>{game.year}</span>
            <span className="game-card__dot">·</span>
            <span>{game.genre || 'Classic'}</span>
          </div>
          <button className="game-card__play-btn" onClick={handlePlay}>
            <Play size={14} fill="white" /> Play Now
          </button>
        </div>
      </div>
    </article>
  )
})

export default GameCard

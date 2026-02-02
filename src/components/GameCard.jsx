import React, { memo, useState } from 'react'
import { Heart, Play, ChevronRight } from 'lucide-react'
import GameBadge from './GameBadge'
import './GameCard.css'

/**
 * GameCard - Modern overlay style with image-first design
 */
const GameCard = memo(function GameCard({
  game,
  navigate,
  isFavorite,
  toggleFavorite,
  onPlay,
  badge
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    toggleFavorite?.(game.id)
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    onPlay ? onPlay(game) : navigate('player')
  }

  return (
    <article
      className={`card ${isHovered ? 'card--hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      {/* Image */}
      <div className="card__image-wrap">
        {game.thumbnailImage ? (
          <img
            src={game.thumbnailImage}
            alt={game.title}
            className="card__image"
            loading="lazy"
          />
        ) : (
          <span className="card__emoji">{game.thumbnail}</span>
        )}

        {/* Gradient Overlay */}
        <div className="card__overlay" />

        {/* Badge */}
        {badge && (
          <div className="card__badge-wrap">
            <GameBadge type={badge} />
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`card__fav ${isFavorite ? 'card__fav--active' : ''}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className="card__fav-icon"
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Info - Bottom */}
      <div className="card__info">
        <div className="card__info-main">
          <h3 className="card__title">{game.title}</h3>
          <div className="card__meta">
            <span className="card__console">{game.console}</span>
            <span className="card__dot">•</span>
            <span className="card__year">{game.year}</span>
          </div>
        </div>

        <button className="card__play" onClick={handlePlay}>
          <Play className="card__play-icon" />
        </button>
      </div>
    </article>
  )
})

export default GameCard

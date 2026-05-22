import React, { memo, useState } from 'react'
import { Heart, Play, Gamepad2 } from 'lucide-react'
import GameBadge from './GameBadge'
import './GameCard.css'

// Classic retro cartridge plastic colors
const RETRO_COLORS = [
  { shell: '#27282b', bar: 'linear-gradient(90deg, #1e3a8a, #2563eb, #1e3a8a)', glow: 'rgba(37, 99, 235, 0.6)' }, // Charcoal -> Blue Glow
  { shell: '#cacbcd', bar: 'linear-gradient(90deg, #b91c1c, #dc2626, #b91c1c)', glow: 'rgba(220, 38, 38, 0.6)' }, // Classic Gray -> Red Glow
  { shell: '#b91c1c', bar: 'linear-gradient(90deg, #1e3a8a, #2563eb, #1e3a8a)', glow: 'rgba(220, 38, 38, 0.7)' }, // Fire Red -> Red Glow
  { shell: 'rgba(20, 120, 60, 0.95)', bar: 'linear-gradient(90deg, #ca8a04, #facc15, #ca8a04)', glow: 'rgba(34, 197, 94, 0.6)' }, // Jungle Green -> Green Glow
  { shell: 'rgba(100, 40, 150, 0.95)', bar: 'linear-gradient(90deg, #ca8a04, #facc15, #ca8a04)', glow: 'rgba(168, 85, 247, 0.7)' }, // Atomic Purple -> Purple Glow
  { shell: 'rgba(40, 150, 200, 0.95)', bar: 'linear-gradient(90deg, #be123c, #e11d48, #be123c)', glow: 'rgba(56, 189, 248, 0.7)' }, // Ice Blue -> Cyan Glow
  { shell: '#d4af37', bar: 'linear-gradient(90deg, #713f12, #854d0e, #713f12)', glow: 'rgba(250, 204, 21, 0.6)' }, // Gold -> Gold Glow
  { shell: '#ea580c', bar: 'linear-gradient(90deg, #1e3a8a, #2563eb, #1e3a8a)', glow: 'rgba(249, 115, 22, 0.7)' }  // Orange -> Orange Glow
]

/**
 * GameCard — Physical Game Cartridge Redesign
 */

const getGamePalette = (game) => {
  const title = (game.title || '').toLowerCase()
  
  if (title.includes('red') || title.includes('mario') || title.includes('fire')) return RETRO_COLORS[2]; // Fire Red
  if (title.includes('green') || title.includes('leaf') || title.includes('emerald') || title.includes('zelda') || title.includes('yoshi')) return RETRO_COLORS[3]; // Jungle Green
  if (title.includes('blue') || title.includes('sapphire') || title.includes('water') || title.includes('ice') || title.includes('sonic')) return RETRO_COLORS[5]; // Ice Blue
  if (title.includes('gold') || title.includes('yellow') || title.includes('pikachu') || title.includes('sun') || title.includes('pac-man')) return RETRO_COLORS[6]; // Gold
  if (title.includes('purple') || title.includes('crystal') || title.includes('crash')) return RETRO_COLORS[4]; // Atomic Purple
  if (title.includes('orange')) return RETRO_COLORS[7]; // Orange
  if (title.includes('black') || title.includes('dark')) return RETRO_COLORS[0]; // Charcoal
  if (title.includes('silver') || title.includes('white') || title.includes('platinum') || title.includes('diamond') || title.includes('pearl')) return RETRO_COLORS[1]; // Classic Gray
  
  // Console-specific defaults for games without explicit color keywords
  if (game.console === 'NES' || game.console === 'GB') return RETRO_COLORS[1]; // Classic Gray
  if (game.console === 'GBA' || game.console === 'NDS') return RETRO_COLORS[0]; // Charcoal
  if (game.console === 'GBC') return RETRO_COLORS[4]; // Atomic Purple

  // Absolute fallback
  return RETRO_COLORS[game.id % RETRO_COLORS.length]
}

const GameCard = memo(function GameCard({
  game,
  navigate,
  isFavorite,
  toggleFavorite,
  onPlay,
  badge
}) {
  const [heartPop, setHeartPop] = useState(false)

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

  // Format console name for CSS class
  const consoleClass = `game-card--${(game.console || 'default').toLowerCase().replace(/\s+/g, '-')}`
  
  // Sync the cartridge color with the game's theme
  const palette = getGamePalette(game)

  return (
    <article
      className={`game-card ${consoleClass}`}
      onClick={handlePlay}
      style={{
        '--dynamic-shell': palette.shell,
        '--dynamic-bar': palette.bar,
        '--dynamic-glow': palette.glow
      }}
    >
      <div className="game-card__3d-wrapper">
        {/* Cartridge Plastic Shell */}
        <div className="game-card__shell">
          
          {/* Top ridges (like SNES/Genesis) */}
          <div className="game-card__ridges" />
          
          {/* Main Label Area */}
          <div className="game-card__label-recess">
            <div className="game-card__label">
              
              {/* Game Art */}
              <img
                src={game.thumbnail || '/thumbnails/default-cover.svg'}
                alt={game.title}
                className="game-card__art"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.target.src = '/thumbnails/default-cover.svg' }}
              />
              
              {/* Scanlines removed per user request */}

              {/* Title Bar (Simulating cartridge branding) */}
              <div className="game-card__branding-bar">
                <span className="game-card__branding-text">{game.console} CARTRIDGE</span>
              </div>

              {/* Info Panel that overlays the sticker */}
              <div className="game-card__panel">
                <h3 className="game-card__title">{game.title}</h3>
                <div className="game-card__meta">
                  <span>{game.year}</span>
                  <span className="game-card__dot">·</span>
                  <span className="game-card__genre-pill">{game.genre || 'Classic'}</span>
                </div>
                <button className="game-card__play-btn" onClick={handlePlay}>
                  <Play size={14} fill="white" /> Insert Cartridge
                </button>
              </div>

            </div>
          </div>
          
          {/* Bottom finger grips */}
          <div className="game-card__bottom-grip">
            <div className="game-card__grip-indent" />
            <div className="game-card__grip-indent" />
            <div className="game-card__grip-indent" />
          </div>

          {/* Badge & Favorite attached to the shell */}
          {badge && (
            <div className="game-card__badge-wrap">
              <GameBadge type={badge} />
            </div>
          )}

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
        </div>
      </div>
    </article>
  )
})

export default GameCard

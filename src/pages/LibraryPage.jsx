import React, { useState, useMemo } from 'react'
import ShinyText from '../components/ShinyText'
import GameCard from '../components/GameCard'
import { games, getConsoles } from '../data/games'
import '../styles/components.css'
import './LibraryPage.css'

/**
 * LibraryPage - Clean game catalog with filters
 */
export default function LibraryPage({
  navigate,
  favorites,
  toggleFavorite,
  onPlayGame,
  defaultFilter = 'ALL'
}) {
  const [selectedConsole, setSelectedConsole] = useState(defaultFilter)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('title-asc')

  const isFavoritesPage = defaultFilter === 'FAVORITES'
  const consoles = isFavoritesPage ? ['FAVORITES'] : ['ALL', 'FAVORITES', ...getConsoles().filter(c => c !== 'ALL')]

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = games

    // Console/Favorites filter
    if (selectedConsole === 'FAVORITES') {
      result = result.filter(g => favorites.includes(g.id))
    } else if (selectedConsole !== 'ALL') {
      result = result.filter(g => g.console === selectedConsole)
    }

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(g => g.title.toLowerCase().includes(q))
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title-desc': return b.title.localeCompare(a.title)
        case 'year-desc': return (b.year || 0) - (a.year || 0)
        case 'year-asc': return (a.year || 0) - (b.year || 0)
        default: return a.title.localeCompare(b.title)
      }
    })

    return result
  }, [selectedConsole, query, sortBy, favorites])

  return (
    <div className="library">
      <div className="library__container">
        {/* Header */}
        <header className="library__header">
          <h1 className="library__title">
            <ShinyText
              text={isFavoritesPage ? '❤️ Your Favorites' : 'Game Library'}
              speed={3}
              className=""
              color="#ffffff"
              shineColor="#8b5cf6"
            />
          </h1>
          <p className="library__count">
            {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          </p>
        </header>

        {/* Filters */}
        <div className="library__filters">
          <div className="filter-group">
            {consoles.map(c => (
              <button
                key={c}
                onClick={() => setSelectedConsole(c)}
                className={`filter-btn ${selectedConsole === c ? 'filter-btn--active' : ''}`}
              >
                {c === 'FAVORITES' ? '❤️ Favorites' : c}
              </button>
            ))}
          </div>

          <div className="library__controls">
            {/* Search */}
            <div className="search-input">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games..."
                className="search-input__field"
              />
              {query && (
                <button
                  className="search-input__clear"
                  onClick={() => setQuery('')}
                >
                  ×
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="library__sort"
            >
              <option value="title-asc">A → Z</option>
              <option value="title-desc">Z → A</option>
              <option value="year-desc">Newest</option>
              <option value="year-asc">Oldest</option>
            </select>
          </div>
        </div>

        {/* Game Grid */}
        {filteredGames.length > 0 ? (
          <div className="game-grid">
            {filteredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                navigate={navigate}
                isFavorite={favorites.includes(game.id)}
                toggleFavorite={toggleFavorite}
                onPlay={onPlayGame}
                badge={game.badge}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">
              {isFavoritesPage || selectedConsole === 'FAVORITES' ? '💔' : '🎮'}
            </div>
            <h3 className="empty-state__title">
              {isFavoritesPage || selectedConsole === 'FAVORITES'
                ? 'No Favorites Yet'
                : 'No Games Found'}
            </h3>
            <p className="empty-state__text">
              {isFavoritesPage || selectedConsole === 'FAVORITES'
                ? 'Click the heart icon on games to add them here'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

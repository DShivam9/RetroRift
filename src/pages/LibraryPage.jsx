import React, { useState, useMemo } from 'react'
import { Upload } from 'lucide-react'
import ShinyText from '../components/ShinyText'
import GameCard from '../components/GameCard'
import CustomSelect from '../components/CustomSelect'
import { games, getConsoles, getGenres, getEras, getEraFromYear } from '../data/games'
import { useDebounce } from '../hooks/useDebounce'
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
  const [selectedGenre, setSelectedGenre] = useState('ALL')
  const [selectedEra, setSelectedEra] = useState('ALL')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [sortBy, setSortBy] = useState('title-asc')

  const isFavoritesPage = defaultFilter === 'FAVORITES'
  // If we are on the main library page, we want to start with 'ALL'. 
  // If we are on the favorites page, we default to 'FAVORITES' but might want to allow filtering favorites by console later?
  // For now, let's keep the logic consistent with the existing code.
  const consoles = isFavoritesPage ? ['FAVORITES'] : ['ALL', 'FAVORITES', ...getConsoles().filter(c => c !== 'ALL')]

  // Memoize static filter options to avoid recalculating on every render (e.g. during search typing)
  const genreOptions = useMemo(() => [
    { value: 'ALL', label: 'All Genres' },
    ...getGenres().map(genre => ({ value: genre, label: genre }))
  ], [])

  const eraOptions = useMemo(() => [
    { value: 'ALL', label: 'All Eras' },
    ...getEras().map(era => ({ value: era, label: era }))
  ], [])

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = games.filter(g => !g.hidden)

    // Console/Favorites filter
    if (selectedConsole === 'FAVORITES') {
      result = result.filter(g => favorites.includes(g.id))
    } else if (selectedConsole !== 'ALL') {
      result = result.filter(g => g.console === selectedConsole)
    }

    // Genre filter
    if (selectedGenre !== 'ALL') {
      result = result.filter(g => g.genre === selectedGenre)
    }

    // Era filter
    if (selectedEra !== 'ALL') {
      result = result.filter(g => getEraFromYear(g.year) === selectedEra)
    }

    // Search filter
    if (debouncedQuery.trim()) {
      const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const term = normalize(debouncedQuery).replace(/\s+/g, '');
      const chars = term.split('');
      const regexStr = chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
      const sequenceRegex = new RegExp(regexStr, 'i');

      result = result.filter(g => {
        const normTitle = normalize(g.title);
        const titleClean = normTitle.replace(/\s+/g, '');
        return sequenceRegex.test(normTitle) || 
               sequenceRegex.test(titleClean) || 
               g.console.toLowerCase().includes(term);
      })
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
  }, [selectedConsole, selectedGenre, selectedEra, debouncedQuery, sortBy, favorites])

  const handleBrowseLibrary = () => {
    navigate('library')
  }

  const showFavoritesBg = isFavoritesPage || selectedConsole === 'FAVORITES'

  return (
    <main className="library">
      {/* Removed library__bg as it looks stretched in the catalog */}

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

            {/* Genre Filter */}
            <CustomSelect
              value={selectedGenre}
              onChange={setSelectedGenre}
              options={genreOptions}
            />

            {/* Era Filter */}
            <CustomSelect
              value={selectedEra}
              onChange={setSelectedEra}
              options={eraOptions}
            />

            {/* Sort */}
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'title-asc', label: 'A → Z' },
                { value: 'title-desc', label: 'Z → A' },
                { value: 'year-desc', label: 'Newest' },
                { value: 'year-asc', label: 'Oldest' }
              ]}
            />

            {/* Bring Your Own ROM */}
            <button
              className="btn btn--primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem' }}
              onClick={() => onPlayGame({
                id: 'custom-rom',
                title: 'Custom Game',
                console: 'GBA',
                requiresUpload: true,
                description: 'Playing a custom ROM file loaded directly from your device.'
              })}
            >
              <Upload size={18} />
              Play Custom ROM
            </button>
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
          <div className="empty-state fade-in-up">
            <div className="empty-state__icon-wrap">
              <div className="empty-state__icon">
                {isFavoritesPage || selectedConsole === 'FAVORITES' ? '💔' : '🎮'}
              </div>
              <div className="empty-state__glow"></div>
            </div>

            <h2 className="empty-state__title">
              {isFavoritesPage || selectedConsole === 'FAVORITES'
                ? 'No Favorites Yet'
                : 'No Games Found'}
            </h2>

            <p className="empty-state__text">
              {isFavoritesPage || selectedConsole === 'FAVORITES'
                ? 'Your collection is empty. Go explore and find some gems!'
                : 'Try adjusting your search or filters to find what you need.'}
            </p>

            {(isFavoritesPage || selectedConsole === 'FAVORITES') && (
              <button className="btn btn--primary empty-state__btn" onClick={handleBrowseLibrary}>
                Browse Library
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

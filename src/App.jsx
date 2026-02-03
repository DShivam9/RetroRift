import React, { useState, useEffect, Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import { Loader } from './components/Loader'
import { useToast } from './components/Toast'
import './App.css'

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

/**
 * App - Main application with hash-based routing
 */
import { SettingsProvider } from './context/SettingsContext'

/**
 * App - Main application with hash-based routing
 */
export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

function AppContent() {
  // Get initial page from URL hash
  const getInitialPage = () => {
    const hash = window.location.hash.slice(1)
    return hash || 'home'
  }

  const [currentPage, setCurrentPage] = useState(getInitialPage)
  const [pageKey, setPageKey] = useState(0)

  // Favorites state (persisted)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Last played game (persisted)
  const [lastPlayed, setLastPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('lastPlayed')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Current game for player
  const [currentGame, setCurrentGame] = useState(() => {
    try {
      const saved = localStorage.getItem('currentGame')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const page = window.location.hash.slice(1) || 'home'
      setCurrentPage(page)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Persist last played
  useEffect(() => {
    if (lastPlayed) {
      localStorage.setItem('lastPlayed', JSON.stringify(lastPlayed))
    }
  }, [lastPlayed])

  // Persist current game
  useEffect(() => {
    if (currentGame) {
      localStorage.setItem('currentGame', JSON.stringify(currentGame))
    }
  }, [currentGame])

  // Navigation with clean transition
  const navigate = (page) => {
    if (page === currentPage) return

    window.history.pushState({ page }, '', `#${page}`)
    setCurrentPage(page)
    setPageKey(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Play game handler
  const onPlayGame = (game) => {
    const payload = {
      id: game.id,
      title: game.title,
      console: game.console,
      year: game.year,
      thumbnail: game.thumbnail,
      thumbnailImage: game.thumbnailImage,
      romPath: game.romPath,
      lastPlayedAt: Date.now()
    }

    setLastPlayed(payload)
    setCurrentGame(game)

    // Update play history
    try {
      const raw = localStorage.getItem('playHistory')
      const history = raw ? JSON.parse(raw) : []
      const filtered = history.filter(h => h.id !== payload.id)
      const updated = [payload, ...filtered].slice(0, 20)
      localStorage.setItem('playHistory', JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to update play history:', err)
    }

    navigate('player')
  }

  // Use toast for notifications
  const toast = useToast()

  // Toggle favorite with toast notification
  const toggleFavorite = (gameId) => {
    const isAdding = !favorites.includes(gameId)
    setFavorites(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )

    // Show toast notification
    if (isAdding) {
      toast.success('Added to favorites!')
    } else {
      toast.info('Removed from favorites')
    }
  }

  // Page props
  const pageProps = {
    navigate,
    favorites,
    toggleFavorite,
    onPlayGame,
    lastPlayed
  }

  return (
    <div className="app">
      {/* Animated Background */}
      <AnimatedBackground />

      <Navbar currentPage={currentPage} navigate={navigate} onPlayGame={onPlayGame} />

      <main className="app__main">
        <Suspense fallback={<Loader text="Loading..." />}>
          <div key={pageKey} className="app__page">
            {currentPage === 'home' && <HomePage {...pageProps} />}
            {currentPage === 'library' && <LibraryPage {...pageProps} />}
            {currentPage === 'favorites' && <LibraryPage {...pageProps} defaultFilter="FAVORITES" />}
            {currentPage === 'player' && <PlayerPage navigate={navigate} game={currentGame} favorites={favorites} toggleFavorite={toggleFavorite} onPlayGame={onPlayGame} />}
            {currentPage === 'profile' && <ProfilePage {...pageProps} />}
            {!['home', 'library', 'favorites', 'player', 'profile'].includes(currentPage) && <NotFoundPage navigate={navigate} />}
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}


import React, { useState, useEffect, Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
import './App.css'


// App: Main application component with client-side routing and state management
export default function App() {
  // Initialize page from URL hash or default to 'home'
  const getInitialPage = () => {
    const hash = window.location.hash.slice(1) // Remove '#'
    return hash || 'home'
  }

  const [currentPage, setCurrentPage] = useState(getInitialPage)
  
  const [favorites, setFavorites] = useState(() => {
    // Restore favorites from localStorage
    try {
      const saved = localStorage.getItem('favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Track last played game for "Continue Playing"
  const [lastPlayed, setLastPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('lastPlayed')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const page = window.location.hash.slice(1) || 'home'
      setCurrentPage(page)
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const parallaxElements = document.querySelectorAll('[data-parallax]')
      parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect()
        const scrollSpeed = parseFloat(element.getAttribute('data-parallax')) || 0.5
        const yOffset = window.scrollY * scrollSpeed
        element.style.transform = `translateY(${yOffset}px)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // cursor/mouse hover animations removed per user request
  useEffect(() => {
    // clear any global throttle if present
    return () => {
      if (window.mouseMoveThrottle) clearTimeout(window.mouseMoveThrottle)
    }
  }, [])

  const [isLoading, setIsLoading] = useState(false)
  const [pageTransition, setPageTransition] = useState(false)

  // Persist favorites whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Persist last played when it changes
  useEffect(() => {
    if (lastPlayed) {
      localStorage.setItem('lastPlayed', JSON.stringify(lastPlayed))
    }
  }, [lastPlayed])

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && currentPage === 'player') {
        navigate('library')
      }
      // Add number key shortcuts for navigation
      const shortcuts = {
        '1': 'home',
        '2': 'library',
        '3': 'profile'
      }
      if (e.altKey && shortcuts[e.key]) {
        navigate(shortcuts[e.key])
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage])

  const navigate = (page) => {
    setIsLoading(true)
    setPageTransition(true)
    
    // Update browser history
    window.history.pushState({ page }, '', `#${page}`)
    
    // Smooth page transitions with scroll reset
    setTimeout(() => {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setPageTransition(false)
      setTimeout(() => setIsLoading(false), 600)
    }, 500)
  }

  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
      return newFavorites
    })
  }

  // Store current game being played - restore from localStorage on mount
  const [currentGame, setCurrentGame] = useState(() => {
    try {
      const saved = localStorage.getItem('currentGame')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Persist current game whenever it changes
  useEffect(() => {
    if (currentGame) {
      localStorage.setItem('currentGame', JSON.stringify(currentGame))
    }
  }, [currentGame])

  // Called when user presses Play on a game card
  const onPlayGame = (game) => {
    console.log('onPlayGame called with:', game)
    
    // store minimal info for resume
    const payload = {
      id: game.id,
      title: game.title,
      console: game.console,
      year: game.year,
      thumbnail: game.thumbnail,
      thumbnailImage: game.thumbnailImage,  // Include thumbnail image
      romPath: game.romPath,  // Important: include romPath!
      lastPlayedAt: Date.now()
    }
    setLastPlayed(payload)
    setCurrentGame(game)  // Pass the full game object

    // Update play history (most recent first, unique by id, capped at 20)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 relative overflow-hidden">
      {/* Retro Effects Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 retro-effects-layer">
        {/* Animated grid background - with parallax */}
        <div className="absolute inset-0 bg-grid opacity-20 animate-grid-shift" data-parallax="0.3" />
        
        {/* Pulsing gradient orbs - optimized for performance with parallax */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl gradient-orb-cyan" data-parallax="0.2" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl gradient-orb-purple" data-parallax="0.25" />
        
        {/* Soft scanlines */}
        <div className="absolute inset-0 crt-scanlines opacity-20" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.3)_100%)]" />
      </div>

      {/* Cursor trail and hover popups removed */}

      <Navbar currentPage={currentPage} navigate={navigate} />

      <main className={`relative z-10 transition-all duration-500 ease-out will-change-transform ${
        pageTransition ? 'opacity-0 scale-98 blur-sm' : 'opacity-100 scale-100 blur-none'
      }`}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="loading-ring">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        }>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="loading-ring">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          ) : (
            <>
              {currentPage === 'home' && 
                <HomePage 
                  navigate={navigate} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite}
                  lastPlayed={lastPlayed}
                  onPlayGame={onPlayGame}
                />}
              {currentPage === 'library' && 
                <LibraryPage 
                  navigate={navigate} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite}
                  onPlayGame={onPlayGame}
                />}
              {currentPage === 'favorites' && 
                <LibraryPage 
                  navigate={navigate} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite}
                  onPlayGame={onPlayGame}
                  defaultFilter="FAVORITES"
                />}
              {currentPage === 'player' && 
                <PlayerPage 
                  navigate={navigate}
                  game={currentGame}
                />}
              {currentPage === 'profile' && 
                <ProfilePage 
                  navigate={navigate} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite}
                  onPlayGame={onPlayGame}
                  lastPlayed={lastPlayed}
                />}
            </>
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

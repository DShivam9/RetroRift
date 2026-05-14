import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import { Loader } from './components/Loader'
import { useToast } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useSettings } from './context/SettingsContext'
import { 
  syncToCloud, 
  loadFromCloud, 
  syncXPData as cloudSyncXPData, 
  loadXPData as cloudLoadXPData 
} from './lib/cloudSaves'
import { loadXPData, onGamePlayed, onFavoriteAdded } from './lib/xpEngine'
import UsernameSetup from './components/UsernameSetup'
import './App.css'
import { games } from './data/games'

// Helper for lazy loading with retry on chunk fail (fixes 404 errors after deployment)
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    )

    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
        window.location.reload()
      }
      throw error
    }
  })

// Lazy-loaded pages
const HomePage = lazyWithRetry(() => import('./pages/HomePage'))
const LibraryPage = lazyWithRetry(() => import('./pages/LibraryPage'))
const PlayerPage = lazyWithRetry(() => import('./pages/PlayerPage'))
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'))
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'))
const FeedbackPage = lazyWithRetry(() => import('./pages/FeedbackPage'))
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'))
import DynamicSEO from './components/DynamicSEO'
import MobileWarning from './components/MobileWarning'

/**
 * App - Main application with hash-based routing
 */
import { SettingsProvider } from './context/SettingsContext'

/**
 * App - Main application with hash-based routing
 */
export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  )
}

function AppContent() {
  // Get initial state from URL path
  const getInitialState = () => {
    const hash = window.location.hash.slice(1)
    if (hash) return { page: hash, game: null }

    const path = window.location.pathname.slice(1)
    if (!path || path === '/') return { page: 'home', game: null }

    // Handle deep links: /play/pokemon-emerald
    if (path.startsWith('play/')) {
      const slug = path.replace('play/', '')
      const foundGame = games.find(g => g.title.toLowerCase().replace(/ /g, '-') === slug)
      if (foundGame) {
        return { page: 'player', game: foundGame }
      }
    }

    return { page: path, game: null }
  }

  const initialState = getInitialState()
  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [pageKey, setPageKey] = useState(0)

  // XP Engine state
  const [xpData, setXpData] = useState(() => loadXPData())

  // Customization state
  const [customization, setCustomization] = useState(() => {
    try {
      const saved = localStorage.getItem('profileCustomization')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

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

  const [currentGame, setCurrentGame] = useState(() => {
    if (initialState.game) return initialState.game
    try {
      const saved = localStorage.getItem('currentGame')
      if (!saved) return null
      const parsed = JSON.parse(saved)
      return games.find(g => g.id === parsed.id) || parsed
    } catch {
      return null
    }
  })

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'home'
      
      if (path.startsWith('play/')) {
        const slug = path.replace('play/', '')
        const foundGame = games.find(g => g.title.toLowerCase().replace(/ /g, '-') === slug)
        if (foundGame) {
          setCurrentGame(foundGame)
          setCurrentPage('player')
          return
        }
      }
      
      setCurrentPage(path)
    }
    window.addEventListener('popstate', handlePopState)
    
    // Legacy redirect: if user arrives with #library, redirect to /library
    const hash = window.location.hash.slice(1)
    if (hash) {
      window.history.replaceState({ page: hash }, '', `/${hash}`)
      window.location.hash = '' // Clear hash without reload
    }

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Global Keyboard Fix: Prevent emulator from stealing keys during typing
  useEffect(() => {
    const handleKeydown = (e) => {
      // Robust detection: Are we in an input, or inside a modal/container that needs typing?
      const isInput = e.target.tagName === 'INPUT' || 
                      e.target.tagName === 'TEXTAREA' || 
                      e.target.isContentEditable ||
                      e.target.closest('.search-modal') ||
                      e.target.closest('.save-modal') ||
                      e.target.closest('.v3-modal');
      
      if (isInput) {
        // stopImmediatePropagation is the most aggressive way to kill competing listeners
        // This ensures the emulator listeners on 'window' or 'document' never see this event
        e.stopImmediatePropagation();
        // console.log('[KeyboardInterceptor] Blocking emulator from stealing focus');
      }
    };

    // Use capture phase (true) + stopImmediatePropagation for total dominance
    window.addEventListener('keydown', handleKeydown, true);
    window.addEventListener('keyup', handleKeydown, true);
    window.addEventListener('keypress', handleKeydown, true);

    return () => {
      window.removeEventListener('keydown', handleKeydown, true);
      window.removeEventListener('keyup', handleKeydown, true);
      window.removeEventListener('keypress', handleKeydown, true);
    };
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

  // Cloud sync: auto-sync when user signs in
  const { user, isAuthenticated, needsUsername, setUsername } = useAuth()
  const { refreshSettings } = useSettings()

  // Global Scroll Reset on Page Change
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0)
    // Small delay to ensure browser doesn't override with scroll restoration
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
      document.body.scrollTo(0, 0)
    }, 0)
    return () => clearTimeout(timer)
  }, [currentPage])

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      // Load global cloud data (favorites, settings, profile)
      loadFromCloud(user.uid).then(data => {
        if (data) {
          if (data.favorites) setFavorites(data.favorites)
          if (data.lastPlayed) setLastPlayed(data.lastPlayed)
          
          // Sync customization from cloud if needed
          if (data.profile) {
            setCustomization(data.profile)
          }

          // Apply settings immediately
          refreshSettings()
          
          // Trigger re-render
          setPageKey(prev => prev + 1)
        }
      }).catch(err => console.error('Cloud metadata load failed:', err))

      // Load XP data from cloud
      cloudLoadXPData(user.uid).then(data => {
        if (data) {
          setXpData(data)
        }
      }).catch(err => console.error('XP cloud load failed:', err))
    }
  }, [isAuthenticated, user?.uid])

  // Auto-sync to cloud when favorites change (if authenticated)
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      const timer = setTimeout(() => {
        // Sync global data
        syncToCloud(user.uid).catch(err => console.error('Cloud save failed:', err))
        // Sync XP data
        cloudSyncXPData(user.uid).catch(err => console.error('XP cloud sync failed:', err))
      }, 2000) // Debounce 2s
      return () => clearTimeout(timer)
    }
  }, [favorites, lastPlayed, xpData, customization, isAuthenticated, user?.uid])

  // Navigation with clean transition
  // Navigation with clean transition
  const lastNavRef = useRef(null)
  const navigate = (page) => {
    if (page === currentPage && lastNavRef.current === page) return
    lastNavRef.current = page

    // Special handling for home root path
    const urlPath = page === 'home' ? '/' : `/${page}`
    window.history.pushState({ page }, '', urlPath)
    
    // Set internal page state (mapping deep links to the player component)
    const targetPage = page.startsWith('play/') ? 'player' : page
    setCurrentPage(targetPage)
    setPageKey(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Play game handler
  const onPlayGame = (gameData) => {
    // Prevent redundant navigation if already on the player page with this game
    if (currentPage === 'player' && currentGame?.id === gameData.id) {
      console.log('[App] Already playing this game, skipping redundant init')
      return
    }

    // Always find the freshest version of the game from the catalog
    const game = games.find(g => g.id === gameData.id) || gameData

    const payload = {
      id: game.id,
      title: game.title,
      console: game.console,
      year: game.year,
      thumbnail: game.thumbnail,
      romPath: game.romPath,
      externalUrl: game.externalUrl,
      requiresUpload: game.requiresUpload,
      lastPlayedAt: Date.now()
    }

    setLastPlayed(payload)
    setCurrentGame(game)

    // Award XP for playing
    if (setXpData) setXpData(prev => onGamePlayed(prev, game))

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

    // Update URL to a shareable deep link
    const slug = game.title.toLowerCase().replace(/ /g, '-')
    navigate(`play/${slug}`)
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
      // Award XP for favoriting
      setXpData(prev => onFavoriteAdded(prev, favorites.length + 1))
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
    lastPlayed,
    xpData,
    setXpData,
    customization,
    setCustomization,
  }

  const isLoginPage = currentPage === 'login'

  return (
    <div className="app">
      <DynamicSEO currentPage={currentPage} currentGame={currentGame} />
      <MobileWarning />
      {/* Animated Background - Hide on long pages to avoid stretching */}
      {currentPage !== 'library' && currentPage !== 'favorites' && <AnimatedBackground />}

      {/* Hide navbar on login */}
      {!isLoginPage && <Navbar currentPage={currentPage} navigate={navigate} onPlayGame={onPlayGame} />}

      <main className="app__main">
        <Suspense fallback={<Loader text="Loading..." />}>
          <div key={currentPage} className={`app__page ${currentPage === 'profile' ? 'app__page--no-transform' : ''}`}>
            {currentPage === 'home' && <HomePage {...pageProps} />}
            {currentPage === 'library' && <LibraryPage {...pageProps} />}
            {currentPage === 'favorites' && <LibraryPage {...pageProps} defaultFilter="FAVORITES" />}
            {currentPage === 'player' && (
              <PlayerPage 
                key={`player-${currentGame?.id || 'none'}`}
                navigate={navigate} 
                game={currentGame} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                onPlayGame={onPlayGame} 
                xpData={xpData} 
                setXpData={setXpData} 
              />
            )}
            {currentPage === 'profile' && <ProfilePage {...pageProps} />}
            {currentPage === 'login' && <LoginPage navigate={navigate} />}
            {currentPage === 'feedback' && <FeedbackPage navigate={navigate} user={user} />}
            {!['home', 'library', 'favorites', 'player', 'profile', 'login', 'feedback'].includes(currentPage) && <NotFoundPage navigate={navigate} />}
          </div>
        </Suspense>
      </main>

      {/* Only show footer on main home page */}
      {currentPage === 'home' && <Footer navigate={navigate} />}

      {/* Username setup modal for new users */}
      {isAuthenticated && needsUsername && (
        <UsernameSetup uid={user.uid} onComplete={setUsername} />
      )}
    </div>
  )
}


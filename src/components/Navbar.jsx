import React, { useState, useEffect } from 'react'
import { Home, Grid3X3, Heart, User, X, Menu, Zap, Trophy, Search, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { games } from '../data/games'
import { useDebounce } from '../hooks/useDebounce'
import './Navbar.css'

/**
 * Navbar - Holographic Command Center (Side Drawer)
 * Premium visuals, interactive data plates, and player stats.
 */
export default function Navbar({ currentPage, navigate, onPlayGame }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = React.useRef(null)
  const { user, isAuthenticated, signOut } = useAuth()
  const [navPhoto, setNavPhoto] = useState(null)

  useEffect(() => {
    const updatePhoto = () => {
      const saved = localStorage.getItem('profilePhoto')
      if (saved) setNavPhoto(saved)
      else if (user?.photoURL) setNavPhoto(user.photoURL)
      else setNavPhoto(null)
    }
    updatePhoto()
    window.addEventListener('profilePhotoChanged', updatePhoto)
    return () => window.removeEventListener('profilePhotoChanged', updatePhoto)
  }, [user?.photoURL])

  useEffect(() => {
    let currentScrolled = false
    
    const handleScroll = (e) => {
      // If the scroll event comes from a popup, tooltip or drawer (not main layout), ignore
      if (e && e.target && e.target.classList && e.target.classList.contains('nav-drawer')) {
        return
      }

      const target = (e && e.target) ? e.target : document
      let scrollPos = 0
      
      if (target === document || target === window || target === document.documentElement || target === document.body) {
        scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      } else if (target && typeof target.scrollTop === 'number') {
        scrollPos = target.scrollTop
      }
      
      const isScrolled = scrollPos > 20
      if (isScrolled !== currentScrolled) {
        currentScrolled = isScrolled
        setScrolled(isScrolled)
      }
    }
    
    // Use capture phase (true) so we capture scroll events that do not bubble from nested scrolling containers
    window.addEventListener('scroll', handleScroll, true)
    
    // Run once on load to capture initial scroll status
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home Base', icon: Home, desc: 'Dashboard' },
    { id: 'library', label: 'Game Library', icon: Grid3X3, desc: 'All Titles' },
    { id: 'favorites', label: 'Favorites', icon: Heart, desc: 'Saved Games' },
    { id: 'profile', label: 'Profile', icon: User, desc: 'Settings & Stats' }
  ]

  const handleNav = (id) => {
    setIsOpen(false)
    navigate(id)
  }

  // Hover interaction
  const timeoutRef = React.useRef(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), 400) // 400ms delay
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  // Debounced search logic - Hyper-forgiving fuzzy search with accent normalization
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      // Normalization helper: strips accents (Pokémon -> Pokemon)
      const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
      const term = normalize(debouncedQuery).replace(/\s+/g, '')
      
      // Sequence matching: "pkm" -> "p.*k.*m" matches "Pokemon"
      const chars = term.split('')
      const regexStr = chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')
      const sequenceRegex = new RegExp(regexStr, 'i')

      const filtered = games.filter(g => {
        const normTitle = normalize(g.title)
        const titleClean = normTitle.replace(/\s+/g, '')
        
        // Match normalized title, clean title, or console
        return sequenceRegex.test(normTitle) || 
               sequenceRegex.test(titleClean) || 
               g.console.toLowerCase().includes(term)
      }).slice(0, 8)

      setSearchResults(filtered)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [debouncedQuery])

  const handleSelectGame = (game) => {
    setSearchQuery('')
    setShowResults(false)
    if (onPlayGame) onPlayGame(game)
  }

  // Close search on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* 1. Full Top Navbar - Slides out of view when scrolled */}
      <header className={`nav-full-header ${scrolled ? 'nav-full-header--hidden' : ''}`}>
        <div className="nav-container-full">
          <button className="nav-brand" onClick={() => navigate('home')}>
            <span className="nav-brand__text" data-text="RETRO">RETRO</span>
            <span className="nav-brand__accent" data-text="RIFT">RIFT</span>
          </button>

          <div className="nav-actions">
            {/* Search Bar - hidden on profile page */}
            {currentPage !== 'profile' && (
              <div className="nav-search" ref={searchRef}>
                <Search className="nav-search__icon" size={18} />
                <input
                  type="text"
                  className="nav-search__input"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                />
                {showResults && searchResults.length > 0 && (
                  <div className="nav-search__results">
                    {searchResults.map(game => (
                      <button
                        key={game.id}
                        className="nav-search__result"
                        onClick={() => handleSelectGame(game)}
                      >
                        <div className="nav-search__result-visual">
                          <img src={game.thumbnail} alt="" className="nav-search__result-thumb" />
                        </div>
                        <div className="nav-search__result-info">
                          <span className="nav-search__result-title">{game.title}</span>
                          <span className="nav-search__result-meta">{game.console} • {game.year}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <button
                className="nav-icon-btn nav-icon-btn--avatar"
                onClick={() => navigate('profile')}
                aria-label="Profile"
              >
                {navPhoto ? (
                  <img src={navPhoto} alt="" className="nav-avatar-img" />
                ) : (
                  <User className="nav-icon-btn__svg" />
                )}
              </button>
            ) : (
              <button
                className="nav-icon-btn nav-icon-btn--login"
                onClick={() => navigate('login')}
                aria-label="Sign In"
              >
                <LogIn className="nav-icon-btn__svg" />
              </button>
            )}

            <button
              className={`nav-trigger ${isOpen ? 'nav-trigger--hidden' : ''}`}
              onClick={() => setIsOpen(true)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="nav-trigger__label">MENU</span>
              <div className="nav-trigger__box">
                <Menu className="nav-trigger__icon" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Floating Micro HUD Console Badge - Fades/scales in when scrolled */}
      <div className={`nav-hud-trigger-wrap ${scrolled ? 'nav-hud-trigger-wrap--visible' : ''}`}>
        <div className="nav-hud-pill">
          {/* Recessed Case Screws (Teenage Engineering style) */}
          <div className="hud-pill-screw hud-pill-screw--tr" />
          <div className="hud-pill-screw hud-pill-screw--br" />

          {/* Pulsing Gamepad Icon */}
          <div className="nav-hud-pill-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="nav-hud-logo-svg">
              <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2.2" className="hud-logo-body" />
              <rect x="8" y="5" width="8" height="6" rx="0.5" strokeWidth="1.5" className="hud-logo-screen" />
              {/* D-Pad */}
              <path d="M8.5 14h3M10 12.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hud-logo-dpad" />
              {/* Buttons */}
              <circle cx="15.5" cy="13.5" r="1.2" fill="currentColor" stroke="none" className="hud-logo-btn-a" />
              <circle cx="14" cy="15.2" r="1.2" fill="currentColor" stroke="none" className="hud-logo-btn-b" />
              {/* Select / Start Pills */}
              <line x1="8" y1="18.5" x2="10" y2="18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hud-logo-select" />
              <line x1="11.5" y1="18.5" x2="13.5" y2="18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hud-logo-start" />
            </svg>
          </div>

          {/* Expanded HUD Clusters */}
          <div className="nav-hud-pill-content">
            {/* Quick Links Cluster */}
            <div className="nav-hud-pill-links">
              <button 
                onClick={() => navigate('home')} 
                className={`nav-hud-pill-link ${currentPage === 'home' ? 'nav-hud-pill-link--active' : ''}`}
                title="Home Base"
              >
                <Home size={16} />
              </button>
              <button 
                onClick={() => navigate('library')} 
                className={`nav-hud-pill-link ${currentPage === 'library' ? 'nav-hud-pill-link--active' : ''}`}
                title="Game Library"
              >
                <Grid3X3 size={16} />
              </button>
              <button 
                onClick={() => navigate('favorites')} 
                className={`nav-hud-pill-link ${currentPage === 'favorites' ? 'nav-hud-pill-link--active' : ''}`}
                title="Favorites"
              >
                <Heart size={16} />
              </button>
              <button 
                onClick={() => navigate('profile')} 
                className={`nav-hud-pill-link ${currentPage === 'profile' ? 'nav-hud-pill-link--active' : ''}`}
                title="Profile"
              >
                <User size={16} />
              </button>
            </div>

            {/* Separator */}
            <div className="nav-hud-pill-divider" />

            {/* Quick Actions Cluster */}
            <div className="nav-hud-pill-actions">
              {isAuthenticated ? (
                <button
                  className="nav-hud-pill-avatar-btn"
                  onClick={() => navigate('profile')}
                  title="Profile"
                >
                  {navPhoto ? (
                    <img src={navPhoto} alt="" className="nav-hud-pill-avatar-img" />
                  ) : (
                    <User size={14} />
                  )}
                </button>
              ) : (
                <button
                  className="nav-hud-pill-action-btn"
                  onClick={() => navigate('login')}
                  title="Sign In"
                >
                  <LogIn size={14} />
                </button>
              )}

              {/* Menu Trigger */}
              <button
                className="nav-hud-pill-menu-btn"
                onClick={() => setIsOpen(true)}
                title="Menu"
              >
                <Menu size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holographic Drawer */}
      <div className={`nav-overlay ${isOpen ? 'nav-overlay--open' : ''}`}>
        <div className="nav-overlay__backdrop" onClick={() => setIsOpen(false)} />

        <div className="nav-drawer">
          {/* Subtle Ambient Background Glow */}
          <div className="nav-drawer__glow" />

          {/* Header & User Widget */}
          <div className="nav-drawer__header">
            <div className="nav-user-widget">
              <div className="nav-user__avatar">
                {isAuthenticated && user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="nav-user__photo" />
                ) : (
                  <User className="nav-user__icon" />
                )}
              </div>
              <div className="nav-user__info">
                <span className="nav-user__name">{isAuthenticated ? (user?.displayName || 'Player') : 'Guest'}</span>
                {isAuthenticated ? (
                  <button className="nav-user__signout" onClick={() => { signOut(); setIsOpen(false) }}>
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button className="nav-user__signin" onClick={() => { setIsOpen(false); navigate('login') }}>
                    <LogIn size={12} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>

            <button className="nav-close" onClick={() => setIsOpen(false)}>
              <X className="nav-close__icon" />
            </button>
          </div>

          <div className="nav-drawer__separator" />

          {/* Navigation Links */}
          <nav className="nav-menu">
            {navItems.map(({ id, label, icon: Icon, desc }, index) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`nav-item ${currentPage === id ? 'nav-item--active' : ''}`}
                style={{ '--i': index }}
              >
                <div className="nav-item__glow" />
                <div className="nav-item__content">
                  <div className="nav-item__icon-box">
                    <Icon className="nav-item__icon" />
                  </div>
                  <div className="nav-item__text">
                    <span className="nav-item__label">{label}</span>
                    <span className="nav-item__desc">{desc}</span>
                  </div>
                </div>
                {currentPage === id && <Zap className="nav-item__indicator" />}
              </button>
            ))}
          </nav>

          {/* Quick Play Launcher using real database games */}
          <div className="nav-drawer__quickplay">
            <span className="quickplay-title">QUICK PLAY</span>
            <div className="quickplay-list">
              {games.slice(0, 3).map(game => (
                <button
                  key={game.id}
                  className="quickplay-card"
                  onClick={() => {
                    setIsOpen(false);
                    if (onPlayGame) onPlayGame(game);
                  }}
                >
                  <div className="quickplay-card__visual">
                    <img src={game.thumbnail} alt="" className="quickplay-card__thumb" />
                  </div>
                  <div className="quickplay-card__info">
                    <span className="quickplay-card__name">{game.title}</span>
                    <span className="quickplay-card__meta">{game.console} • {game.genre}</span>
                  </div>
                  <Zap size={10} className="quickplay-card__play-icon" />
                </button>
              ))}
            </div>
          </div>

          {/* Decorative Spirit Container */}
          <div className="nav-drawer__footer">
            <div className="nav-spirits">
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/151.gif" 
                alt="Mew" 
                className="nav-spirit nav-spirit--mew"
              />
            </div>
            <div className="nav-footer-accent" />
          </div>
        </div>
      </div>
    </>
  )
}

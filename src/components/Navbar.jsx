import React, { useState, useEffect } from 'react'
import { Home, Grid3X3, Heart, User, X, Menu, Zap, Trophy, Search, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { games } from '../data/games'
import './Navbar.css'

/**
 * Navbar - Holographic Command Center (Side Drawer)
 * Premium visuals, interactive data plates, and player stats.
 */
export default function Navbar({ currentPage, navigate, onPlayGame }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  // Search logic
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim().length > 0) {
      const results = games.filter(g =>
        g.title.toLowerCase().includes(query.toLowerCase()) ||
        g.console.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
      setSearchResults(results)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

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
      {/* Trigger Area */}
      <div className={`nav-trigger-wrap ${scrolled ? 'nav-trigger-wrap--scrolled' : ''}`}>
        <button className="nav-brand" onClick={() => navigate('home')}>
          <span className="nav-brand__text">RETRO</span>
          <span className="nav-brand__accent">RIFT</span>
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
                onChange={(e) => handleSearch(e.target.value)}
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
                      <span className="nav-search__result-title">{game.title}</span>
                      <span className="nav-search__result-meta">{game.console}</span>
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

      {/* Holographic Drawer */}
      <div className={`nav-overlay ${isOpen ? 'nav-overlay--open' : ''}`}>
        <div className="nav-overlay__backdrop" onClick={() => setIsOpen(false)} />

        <div className="nav-drawer">
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

          {/* Footer System Status */}
          <div className="nav-drawer__footer">
            <div className="nav-sys-status">
              <div className="nav-sys__dot" />
              <span className="nav-sys__text">SYSTEM ONLINE</span>
            </div>
            <span className="nav-version">v2.1.0</span>
          </div>
        </div>
      </div>
    </>
  )
}

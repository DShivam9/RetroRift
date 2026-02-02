import React, { useState, useEffect } from 'react'
import { Home, Grid3X3, Heart, User, X, Menu, Zap, Trophy } from 'lucide-react'
import './Navbar.css'

/**
 * Navbar - Holographic Command Center (Side Drawer)
 * Premium visuals, interactive data plates, and player stats.
 */
export default function Navbar({ currentPage, navigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  return (
    <>
      {/* Trigger Area */}
      <div className={`nav-trigger-wrap ${scrolled ? 'nav-trigger-wrap--scrolled' : ''}`}>
        <button className="nav-brand" onClick={() => navigate('home')}>
          <span className="nav-brand__text">RETRO</span>
          <span className="nav-brand__accent">RIFT</span>
        </button>

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

      {/* Holographic Drawer */}
      <div className={`nav-overlay ${isOpen ? 'nav-overlay--open' : ''}`}>
        <div className="nav-overlay__backdrop" onClick={() => setIsOpen(false)} />

        <div className="nav-drawer">
          {/* Header & User Widget */}
          <div className="nav-drawer__header">
            <div className="nav-user-widget">
              <div className="nav-user__avatar">
                <User className="nav-user__icon" />
              </div>
              <div className="nav-user__info">
                <span className="nav-user__name">Player 1</span>
                <div className="nav-user__rank">
                  <Trophy className="nav-user__rank-icon" />
                  <span className="nav-user__rank-text">Level 5</span>
                </div>
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

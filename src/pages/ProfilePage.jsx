import React, { useState, useEffect } from 'react'
import ShinyText from '../components/ShinyText'
import GameCard from '../components/GameCard'
import { games, getGameById } from '../data/games'
import { User, Heart, Gamepad2, Clock } from 'lucide-react'
import '../styles/components.css'
import './ProfilePage.css'

/**
 * ProfilePage - User dashboard with clean design
 */
export default function ProfilePage({ navigate, favorites, toggleFavorite, onPlayGame, lastPlayed }) {
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profileName, setProfileName] = useState('Player One')

  // Load profile from localStorage
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    const savedName = localStorage.getItem('profileName')
    if (savedPhoto) setProfilePhoto(savedPhoto)
    if (savedName) setProfileName(savedName)
  }, [])

  // Get play history
  const playHistory = (() => {
    try {
      const raw = localStorage.getItem('playHistory')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  // Get favorite games
  const favoriteGames = games.filter(g => favorites.includes(g.id))

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      setProfilePhoto(dataUrl)
      localStorage.setItem('profilePhoto', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="profile">
      <div className="profile__container">
        {/* Header Card */}
        <div className="profile__header">
          <div className="profile__avatar-wrap">
            <div className="profile__avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="profile__avatar-img" />
              ) : (
                <User className="profile__avatar-icon" />
              )}
            </div>
            <label className="profile__avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="profile__avatar-input"
              />
              📷
            </label>
          </div>

          <div className="profile__info">
            <h1 className="profile__name">
              <ShinyText
                text={profileName}
                speed={3}
                className=""
                color="#ffffff"
                shineColor="#8b5cf6"
              />
            </h1>
            <p className="profile__bio">Retro gaming enthusiast</p>
          </div>
        </div>

        {/* Stats */}
        <div className="profile__stats">
          <div className="profile__stat">
            <Heart className="profile__stat-icon profile__stat-icon--pink" />
            <div className="profile__stat-content">
              <span className="profile__stat-value">{favorites.length}</span>
              <span className="profile__stat-label">Favorites</span>
            </div>
          </div>
          <div className="profile__stat">
            <Gamepad2 className="profile__stat-icon profile__stat-icon--cyan" />
            <div className="profile__stat-content">
              <span className="profile__stat-value">{playHistory.length}</span>
              <span className="profile__stat-label">Sessions</span>
            </div>
          </div>
          <div className="profile__stat">
            <Clock className="profile__stat-icon profile__stat-icon--purple" />
            <div className="profile__stat-content">
              <span className="profile__stat-value">4</span>
              <span className="profile__stat-label">Consoles</span>
            </div>
          </div>
        </div>

        {/* Continue Playing */}
        {lastPlayed && (
          <section className="profile__section">
            <h2 className="profile__section-title">
              <ShinyText text="Continue Playing" speed={3} color="#ffffff" shineColor="#8b5cf6" />
            </h2>
            <div className="game-grid" style={{ maxWidth: '320px' }}>
              <GameCard
                game={lastPlayed}
                navigate={navigate}
                isFavorite={favorites.includes(lastPlayed.id)}
                toggleFavorite={toggleFavorite}
                onPlay={onPlayGame}
              />
            </div>
          </section>
        )}

        {/* Favorites */}
        {favoriteGames.length > 0 && (
          <section className="profile__section">
            <div className="profile__section-header">
              <h2 className="profile__section-title">
                <ShinyText text="Your Favorites" speed={3} color="#ffffff" shineColor="#8b5cf6" />
              </h2>
              <button
                className="btn btn--ghost"
                onClick={() => navigate('favorites')}
              >
                View All →
              </button>
            </div>
            <div className="game-grid">
              {favoriteGames.slice(0, 4).map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  navigate={navigate}
                  isFavorite={true}
                  toggleFavorite={toggleFavorite}
                  onPlay={onPlayGame}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Games */}
        {playHistory.length > 0 && (
          <section className="profile__section">
            <h2 className="profile__section-title">
              <ShinyText text="Recent Games" speed={3} color="#ffffff" shineColor="#8b5cf6" />
            </h2>
            <div className="profile__recent">
              {playHistory.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  className="profile__recent-item"
                  onClick={() => onPlayGame(item)}
                >
                  <span className="profile__recent-emoji">{item.thumbnail}</span>
                  <div className="profile__recent-info">
                    <span className="profile__recent-title">{item.title}</span>
                    <span className="profile__recent-console">{item.console}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import GameCard from '../components/GameCard'
import GridScan from '../components/GridScan'
import { getFeaturedGames, getGameById, getAllGames } from '../data/games'
import {
  Play, ChevronRight, Sparkles, Trophy,
  Gamepad2, Music, Shuffle, Settings, Heart
} from 'lucide-react'
import { useToast } from '../components/Toast' // Import Toast
import RotatingText from '../components/RotatingText'
import ShinyText from '../components/ShinyText'
import HoloCartridge from '../components/HoloCartridge'
import VerticalGameTicker from '../components/VerticalGameTicker'
import { motion, AnimatePresence } from 'framer-motion'
import { loadXPData, getStats, timeAgo, onQuestAccepted } from '../lib/xpEngine'
import { useAuth } from '../context/AuthContext'
import './HomePage.css'

/**
 * GlitchText - Scrambles text using ASCII characters during transitions
 */
const GlitchText = ({ text, isChanging }) => {
  const [displayText, setDisplayText] = useState(text)
  const chars = '!@#$%^&*()_+{}:"<>?|~`-=[]\';,./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  useEffect(() => {
    if (isChanging) {
      let iterations = 0
      const interval = setInterval(() => {
        setDisplayText(prev => 
          text.split('').map((char, index) => {
            if (index < iterations) return text[index]
            return chars[Math.floor(Math.random() * chars.length)]
          }).join('')
        )
        iterations += 1/3
        if (iterations >= text.length) clearInterval(interval)
      }, 30)
      return () => clearInterval(interval)
    } else {
      setDisplayText(text)
    }
  }, [text, isChanging])

  return <span>{displayText}</span>
}

/**
 * HomePage - Clean retro gaming experience
 */
export default function HomePage({ navigate, favorites, toggleFavorite, lastPlayed, onPlayGame, xpData, setXpData }) {
  const featuredRef = useRef(null)
  const continueRef = useRef(null)
  const { user, isAuthenticated } = useAuth()

  const [featuredVisible, setFeaturedVisible] = useState(false)
  const [continueVisible, setContinueVisible] = useState(false)
  const [isQuestHovered, setIsQuestHovered] = useState(false)
  
  const [questAccepted, setQuestAccepted] = useState(() => {
    try {
      const key = user?.uid ? `quest_accepted_${user.uid}` : 'quest_accepted_guest'
      return localStorage.getItem(key) === 'true'
    } catch {
      return false
    }
  })

  // Sync quest status when authenticated user switches
  useEffect(() => {
    try {
      const key = user?.uid ? `quest_accepted_${user.uid}` : 'quest_accepted_guest'
      setQuestAccepted(localStorage.getItem(key) === 'true')
    } catch {
      setQuestAccepted(false)
    }
  }, [user])

  // Random Button Ticker
  const [randomLabel, setRandomLabel] = useState('Random')
  const [isRandomHovered, setIsRandomHovered] = useState(false)

  // Music & Config Hovers
  const [isMusicHovered, setIsMusicHovered] = useState(false)
  const [isConfigHovered, setIsConfigHovered] = useState(false)

  // Gamer Telemetry Stats
  const [xpStats, setXpStats] = useState(null)

  // Load 12 games for a rich scrolling marquee
  const featuredGames = React.useMemo(() => getFeaturedGames(12), [])
  const [activeGame, setActiveGame] = useState(featuredGames[0] || null)
  const allGames = getAllGames()
  const toast = useToast()
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const currentXP = xpData || loadXPData()
    const stats = getStats(currentXP)
    setXpStats(stats)
  }, [xpData, favorites])

  useEffect(() => {
    if (!isRandomHovered) {
      setRandomLabel('Random')
      return
    }
    const titles = ['SONIC', 'POKÉMON', 'ZELDA', 'MARIO', 'TETRIS', 'METROID', 'PAC-MAN']
    let idx = 0
    const interval = setInterval(() => {
      setRandomLabel(titles[idx % titles.length])
      idx++
    }, 150)
    return () => clearInterval(interval)
  }, [isRandomHovered])

  useEffect(() => {
    setIsChanging(true)
    const timer = setTimeout(() => setIsChanging(false), 600)
    return () => clearTimeout(timer)
  }, [activeGame])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target === featuredRef.current && entry.isIntersecting) {
            setFeaturedVisible(true)
          }
          if (entry.target === continueRef.current && entry.isIntersecting) {
            setContinueVisible(true)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    if (featuredRef.current) observer.observe(featuredRef.current)
    if (continueRef.current) observer.observe(continueRef.current)
    return () => observer.disconnect()
  }, [])

  const continueGame = lastPlayed || getGameById(1)

  // Handlers for Dashboard
  const handleDailyQuest = () => {
    if (questAccepted) return
    toast.success('QUEST STARTED: Beat Green Hill Zone Act 1 < 45s')
    setQuestAccepted(true)
    try {
      const key = user?.uid ? `quest_accepted_${user.uid}` : 'quest_accepted_guest'
      localStorage.setItem(key, 'true')
    } catch (e) {
      console.warn(e)
    }

    if (setXpData) {
      setXpData(prev => onQuestAccepted(prev, 'Daily Quest (Speedrun Act 1)', 15))
    }
  }

  const handleRandomGame = () => {
    const random = allGames[Math.floor(Math.random() * allGames.length)]
    toast.info(`Rolled: ${random.title}`)
    if (onPlayGame) onPlayGame(random)
  }

  const handleMusicToggle = () => {
    toast.info('Background Music: ON (Visual Only)')
  }

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__background">
          <GridScan
            sensitivity={0.1}
            linesColor="#0a0a0f"
            scanColor="#8b5cf6"
            scanOpacity={0.35}
            gridScale={0.2}
            lineThickness={0.6}
            lineJitter={0}
            scanDirection="pingpong"
            scanDuration={8}
            scanDelay={5}
            scanGlow={0.25}
            scanSoftness={5}
            bloomIntensity={0.15}
            chromaticAberration={0.0005}
            noiseIntensity={0}
            scanOnClick={false}
            snapBackDelay={1500}
          />
        </div>

        <div className="hero__layout">
          <div className="hero__text-col">
            <h1 className="hero__title">
              Play Your Favorite<br />
              <ShinyText
                text="Retro Console Games"
                className="hero__title-accent"
                color="#8b5cf6"
                shineColor="#e0b0ff"
                speed={3}
              />
            </h1>

            <p className="hero__desc">
              Experience classic titles with high-performance emulation and secure cloud saves. No downloads required.
            </p>

            <div className="hero__buttons">
              <button
                className="hero__btn hero__btn--primary"
                onClick={() => activeGame && onPlayGame(activeGame)}
              >
                <Play className="hero__btn-icon" />
                Play <GlitchText text={activeGame?.title || 'Now'} isChanging={isChanging} />
              </button>
              <button
                className="hero__btn hero__btn--ghost"
                onClick={() => navigate('library')}
              >
                Browse Library
                <ChevronRight className="hero__btn-icon" />
              </button>
            </div>
          </div>

          <div className="hero__visual-col">
            <VerticalGameTicker 
              games={featuredGames} 
              activeGame={activeGame} 
              setActiveGame={setActiveGame} 
              onPlayGame={onPlayGame} 
            />
            
            <div className="hero__cartridge-wrapper">
              <HoloCartridge activeGame={activeGame} />
            </div>
          </div>
        </div>
      </section>

      {/* Continue Playing + Interactive Panel */}
      {continueGame && (
        <section ref={continueRef} className={`section ${continueVisible ? 'section--visible' : ''}`}>
          <div className="section__inner">
            <div className="continue-layout">
              {/* Left: Continue Game */}
              <div className="continue-left">
                <span className="section__tag">CONTINUE</span>
                <h2 className="section__title">
                  <ShinyText
                    text="Resume Your Game"
                    disabled={false}
                    speed={3}
                    className=""
                    color="#ffffff"
                    shineColor="#8b5cf6"
                  />
                </h2>
                <div className="continue-card">
                  <GameCard
                    game={continueGame}
                    navigate={navigate}
                    isFavorite={favorites.includes(continueGame.id)}
                    toggleFavorite={toggleFavorite}
                    onPlay={onPlayGame}
                  />
                </div>
              </div>

              {/* Right: Dashboard / Interactive Panel */}
              <div className="continue-right">
                <div 
                  className="dashboard-card dashboard-card--highlight"
                  onMouseEnter={() => setIsQuestHovered(true)}
                  onMouseLeave={() => setIsQuestHovered(false)}
                >
                  <div className={`dashboard-card__icon-wrap ${isQuestHovered ? 'dashboard-card__icon-wrap--hovered' : ''}`}>
                    <Trophy className={`dashboard-card__icon ${isQuestHovered ? 'dashboard-card__icon--gold' : ''}`} />
                  </div>
                  <div className="dashboard-card__content">
                    <span className="dashboard-card__label">DAILY QUEST</span>
                    <h3 className="dashboard-card__title">Speedrun Act 1</h3>
                    <p className="dashboard-card__text">Beat Green Hill Zone under 45s</p>
                  </div>
                  <button
                    className={`dashboard-card__action ${questAccepted ? 'dashboard-card__action--disabled' : ''}`}
                    onClick={handleDailyQuest}
                    disabled={questAccepted}
                    style={questAccepted ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {questAccepted ? 'Accepted' : 'Accept'}
                  </button>
                </div>

                {/* Quick Actions Grid */}
                <div className="quick-grid">
                  <button 
                    className="quick-btn" 
                    onClick={handleRandomGame}
                    onMouseEnter={() => setIsRandomHovered(true)}
                    onMouseLeave={() => setIsRandomHovered(false)}
                  >
                    <div className="quick-btn__icon-box">
                      <Shuffle className="quick-btn__icon" />
                    </div>
                    <span>{randomLabel}</span>
                  </button>

                  <button className="quick-btn" onClick={() => navigate('favorites')}>
                    <div className="quick-btn__icon-box quick-btn__icon-box--pink" style={{ position: 'relative' }}>
                      <Heart className="quick-btn__icon" />
                      <span className="sonar-ring" />
                      <span className="sonar-ring sonar-ring--delay" />
                    </div>
                    <span>Favorites</span>
                  </button>

                  <button 
                    className="quick-btn" 
                    onClick={handleMusicToggle}
                    onMouseEnter={() => setIsMusicHovered(true)}
                    onMouseLeave={() => setIsMusicHovered(false)}
                  >
                    <div className="quick-btn__icon-box quick-btn__icon-box--blue" style={{ position: 'relative', overflow: 'hidden' }}>
                      <Music className={`quick-btn__icon ${isMusicHovered ? 'quick-btn__icon--music-active' : ''}`} />
                      {isMusicHovered && (
                        <div className="eq-bars">
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                        </div>
                      )}
                    </div>
                    <span>Music</span>
                  </button>

                  <button 
                    className="quick-btn" 
                    onClick={() => navigate('profile')}
                    onMouseEnter={() => setIsConfigHovered(true)}
                    onMouseLeave={() => setIsConfigHovered(false)}
                  >
                    <div className="quick-btn__icon-box quick-btn__icon-box--gray">
                      <Settings className={`quick-btn__icon ${isConfigHovered ? 'quick-btn__icon--spin' : ''}`} />
                    </div>
                    <div className="quick-btn__label-container">
                      <span>Config</span>
                    </div>
                  </button>
                </div>

                {/* Gamer Progression & XP Telemetry HUD */}
                {xpStats && (
                  <div className="console-deck">
                    <div className="console-deck__col console-deck__col--left">
                      <div className="console-deck__header">
                        <span className="console-deck__tag">LEVEL PROGRESSION</span>
                        <div className="console-deck__badge">
                          <span>{xpStats.emoji} {xpStats.title}</span>
                        </div>
                      </div>
                      
                      <div className="console-deck__level-row">
                        <span className="console-deck__level-val">LVL {xpStats.level}</span>
                        <span className="console-deck__xp-val">{xpStats.xpInLevel} / {xpStats.xpNeeded} XP</span>
                      </div>
                      
                      <div className="console-deck__progress-track">
                        <div 
                          className="console-deck__progress-fill" 
                          style={{ width: `${xpStats.progress * 100}%` }}
                        >
                          <div className="console-deck__progress-energy" />
                        </div>
                      </div>
                      
                      <div className="console-deck__stats-grid">
                        <div className="console-deck__stat-item">
                          <span className="console-deck__stat-icon">⚡</span>
                          <div className="console-deck__stat-info">
                            <span className="console-deck__stat-label">STREAK</span>
                            <span className="console-deck__stat-value">{xpStats.currentStreak} Days</span>
                          </div>
                        </div>
                        <div className="console-deck__stat-item">
                          <span className="console-deck__stat-icon">🎮</span>
                          <div className="console-deck__stat-info">
                            <span className="console-deck__stat-label">PLAYED</span>
                            <span className="console-deck__stat-value">{xpStats.gamesPlayed} Games</span>
                          </div>
                        </div>
                        <div className="console-deck__stat-item">
                          <span className="console-deck__stat-icon">🏆</span>
                          <div className="console-deck__stat-info">
                            <span className="console-deck__stat-label">BADGES</span>
                            <span className="console-deck__stat-value">{xpStats.unlockedCount} / {xpStats.totalAchievements}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="console-deck__col console-deck__col--right">
                      <div className="console-deck__header">
                        <span className="console-deck__tag">XP TELEMETRY LOG</span>
                      </div>
                      
                      <div className="console-deck__log-feed">
                        {xpStats.xpLog && xpStats.xpLog.length > 0 ? (
                          xpStats.xpLog.slice(0, 3).map((log, i) => (
                             <div key={i} className="console-deck__log-item animate-fade-in">
                               <span className="console-deck__log-xp">+{log.amount} XP</span>
                               <span className="console-deck__log-reason">{log.reason}</span>
                               <span className="console-deck__log-time">{timeAgo(log.timestamp)}</span>
                             </div>
                          ))
                        ) : (
                          <div className="console-deck__log-empty">
                            <span className="console-deck__log-cursor">_</span>
                            <p>SYSTEM BOOT COMPLETE.</p>
                            <p>START PLAYING TO EARN XP & LOG TELEMETRY.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Games */}
      <section ref={featuredRef} className={`section section--dark ${featuredVisible ? 'section--visible' : ''}`}>
        <div className="section__inner">
          <div className="section__head section__head--between">
            <div>
              <span className="section__tag">
                <Sparkles className="section__tag-icon" />
                FEATURED
              </span>
              <h2 className="section__title">
                <ShinyText
                  text="Popular Games"
                  disabled={false}
                  speed={4}
                  className=""
                  color="#ffffff"
                  shineColor="#8b5cf6"
                />
              </h2>
            </div>
            <button className="section__more" onClick={() => navigate('library')}>
              View All <ChevronRight className="section__more-icon" />
            </button>
          </div>

          <div className="game-grid">
            {featuredGames.map((game, index) => (
              <div
                key={game.id}
                className={`game-grid__item ${featuredVisible ? 'game-grid__item--show' : ''}`}
                style={{ '--i': index }}
              >
                <GameCard
                  game={game}
                  navigate={navigate}
                  isFavorite={favorites.includes(game.id)}
                  toggleFavorite={toggleFavorite}
                  onPlay={onPlayGame}
                  badge={game.badge}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
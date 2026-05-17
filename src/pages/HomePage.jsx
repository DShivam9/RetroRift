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
import './HomePage.css'

/**
 * GlitchText - Scrambles text using ASCII characters during transitions
 */
const GlitchText = ({ text, isChanging }) => {
  const [displayText, setDisplayText] = useState(text)
  const chars = '!@#$%^&*()_+{}:"<>?|~`-=[]\\\';,./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
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
export default function HomePage({ navigate, favorites, toggleFavorite, lastPlayed, onPlayGame }) {
  const featuredRef = useRef(null)
  const continueRef = useRef(null)

  const [featuredVisible, setFeaturedVisible] = useState(false)
  const [continueVisible, setContinueVisible] = useState(false)
  const [questAccepted, setQuestAccepted] = useState(false)
  // Load 12 games for a rich scrolling marquee
  const featuredGames = React.useMemo(() => getFeaturedGames(12), [])
  const [activeGame, setActiveGame] = useState(featuredGames[0] || null)
  const allGames = getAllGames()
  const toast = useToast()
  const [isChanging, setIsChanging] = useState(false)

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
                {/* Daily Challenge Card */}
                <div className="dashboard-card dashboard-card--highlight">
                  <div className="dashboard-card__icon-wrap">
                    <Trophy className="dashboard-card__icon" />
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
                  <button className="quick-btn" onClick={handleRandomGame}>
                    <div className="quick-btn__icon-box">
                      <Shuffle className="quick-btn__icon" />
                    </div>
                    <span>Random</span>
                  </button>

                  <button className="quick-btn" onClick={() => navigate('favorites')}>
                    <div className="quick-btn__icon-box quick-btn__icon-box--pink">
                      <Heart className="quick-btn__icon" />
                    </div>
                    <span>Favorites</span>
                  </button>

                  <button className="quick-btn" onClick={handleMusicToggle}>
                    <div className="quick-btn__icon-box quick-btn__icon-box--blue">
                      <Music className="quick-btn__icon" />
                    </div>
                    <span>Music</span>
                  </button>

                  <button className="quick-btn" onClick={() => navigate('profile')}>
                    <div className="quick-btn__icon-box quick-btn__icon-box--gray">
                      <Settings className="quick-btn__icon" />
                    </div>
                    <span>Config</span>
                  </button>
                </div>
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
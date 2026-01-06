import React from 'react'
import { useEffect, useRef, useState } from 'react'
import GameCard from '../components/GameCard'
import '../components/hero-animations.css'

// HomePage: hero, featured grid and CTA. Placeholder thumbnails are used.
export default function HomePage({ navigate, favorites, toggleFavorite, lastPlayed, onPlayGame }) {
  const featuredRef = useRef(null)
  const continueRef = useRef(null)
  const [featuredVisible, setFeaturedVisible] = useState(false)
  const [continueVisible, setContinueVisible] = useState(false)

  useEffect(() => {
    const observerOptions = { 
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    }

    const featuredObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !featuredVisible) {
          setFeaturedVisible(true)
        }
      })
    }, observerOptions)

    const continueObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !continueVisible) {
          setContinueVisible(true)
        }
      })
    }, observerOptions)

    const currentFeaturedRef = featuredRef.current
    const currentContinueRef = continueRef.current

    if (currentFeaturedRef) {
      featuredObserver.observe(currentFeaturedRef)
    }

    if (currentContinueRef) {
      continueObserver.observe(currentContinueRef)
    }

    return () => {
      if (currentFeaturedRef) {
        featuredObserver.unobserve(currentFeaturedRef)
      }
      if (currentContinueRef) {
        continueObserver.unobserve(currentContinueRef)
      }
    }
  }, [featuredVisible, continueVisible])

  const featuredGames = [
    { id: 1, title: 'Pokemon FireRed', console: 'GBA', year: 2004, thumbnail: '🔥', thumbnailImage: '/thumbnails/pokemon_firered.jpg', romPath: '/roms/pokemon_firered.gba' },
    { id: 2, title: 'Pokemon Ruby', console: 'GBA', year: 2002, thumbnail: '💎', thumbnailImage: '/thumbnails/pokemon_ruby.jpg', romPath: '/roms/pokemon_ruby.gba' },
    { id: 3, title: 'Pokemon Sapphire', console: 'GBA', year: 2002, thumbnail: '💧', thumbnailImage: '/thumbnails/pokemon_sapphire.jpg', romPath: '/roms/pokemon_sapphire.gba' },
    { id: 5, title: 'Pokemon Emerald', console: 'GBA', year: 2004, thumbnail: '💚', thumbnailImage: '/thumbnails/pokemon_emerald.jpg', romPath: '/roms/pokemon_emerald.gba' },
    { id: 6, title: 'Mario Kart: Super Circuit', console: 'GBA', year: 2001, thumbnail: '🏎️', thumbnailImage: '/thumbnails/mariokart_supercircuit.jpg', romPath: '/roms/mariokart_supercircuit.gba' },
    { id: 7, title: 'Pac-Man (Namco)', console: 'NES', year: 1984, thumbnail: '🟡', thumbnailImage: '/thumbnails/pacman.jpeg', romPath: '/roms/pacman.nes' },
  { id: 8, title: 'Sonic 3D Blast', console: 'SegaCD', year: 1996, thumbnail: '🦔', thumbnailImage: '/thumbnails/sonic3dblast.jpg', romPath: '/roms/sonic3dblast/Sonic 3D Blast (USA).cue' },
  { id: 9, title: 'Pokemon: Platinum Version', console: 'NDS', year: 2008, thumbnail: '💿', thumbnailImage: '/thumbnails/pokemon_platinum.jpg', romPath: '/roms/pokemon_platinum.nds' }
  ]

  return (
    <div className="w-full min-h-screen">
      {/* Full viewport hero section */}
      <section 
        className="content-section hero-background relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-8 pb-4"
        onMouseMove={(e) => {
          const section = e.currentTarget
          const rect = section.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          section.style.setProperty('--mouse-x', `${x}px`)
          section.style.setProperty('--mouse-y', `${y}px`)
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.setProperty('--spotlight-opacity', '1')
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.setProperty('--spotlight-opacity', '0')
        }}
        style={{
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-opacity': '0'
        }}
      >
        {/* Animated particles with pixel art sprites */}
        <div className="particles">
          {[...Array(25)].map((_, i) => {
            const sprites = ['👾', '🎮', '�️', '⚡', '�', '⭐', '🔮', '👻', '🍄', '🪙'];
            const colors = ['cyan', 'purple', 'magenta'];
            return (
              <div
                key={i}
                className={`particle ${colors[i % colors.length]}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${12 + Math.random() * 12}s`,
                  animationDelay: `${Math.random() * 8}s`,
                  ['--drift']: `${(Math.random() - 0.5) * 300}px`,
                  fontSize: `${16 + Math.random() * 12}px`
                }}
              >
                {sprites[i % sprites.length]}
              </div>
            );
          })}
        </div>
        
        {/* Cyber grid background */}
        <div className="cyber-grid"></div>
        
        {/* Ghost large title behind for depth */}
        <div className="hero-ghost absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl pointer-events-none select-none">
          RETRO PLAY HUB
        </div>

        <div className="relative z-10 text-center space-y-12 px-4">
          {/* Main Title */}
          <div className="flex flex-col items-center">
            <h2 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '900', letterSpacing: '0.12em' }}>
              <div className="flex justify-center mb-2">
                {"RELIVE".split("").map((ch, i) => (
                  <span 
                    key={i} 
                    className="char inline-block" 
                    style={{ 
                      ['--delay']: `${i * 50}ms`,
                      ['--hue']: `${i * 10}deg`,
                      animation: `title-reveal 0.5s ease forwards ${i * 50}ms`
                    }}
                    data-char={ch}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <div className="flex justify-center">
                {"THE".split("").map((ch, i) => (
                  <span 
                    key={i} 
                    className="char inline-block" 
                    style={{ 
                      ['--delay']: `${(i + 6) * 50}ms`,
                      ['--hue']: `${(i + 6) * 10}deg`,
                      animation: `title-reveal 0.5s ease forwards ${(i + 6) * 50}ms`
                    }}
                    data-char={ch}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <div className="flex justify-center">
                {"CLASSICS".split("").map((ch, i) => (
                  <span 
                    key={i} 
                    className="char inline-block" 
                    style={{ 
                      ['--delay']: `${(i + 9) * 50}ms`,
                      ['--hue']: `${(i + 9) * 10}deg`,
                      animation: `title-reveal 0.5s ease forwards ${(i + 9) * 50}ms`
                    }}
                    data-char={ch}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </h2>
          </div>

          {/* Subtitle */}
          <p className="hero-sub text-lg md:text-xl font-mono tracking-wide max-w-2xl mx-auto">
            {"No Downloads. No Setup. Just Play.".split("").map((ch, i) => (
              <span 
                key={i} 
                className="char inline-block" 
                style={{ 
                  ['--delay']: `${i * 30}ms`,
                  ['--float-offset']: `${Math.random() * 10}px`
                }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </p>

          {/* Marquee integrated into hero with seamless infinite loop */}
          <div className="marquee-container mt-8 mb-4">
            <div className="marquee-content">
              {[...Array(40)].map((_, i) => (
                <span key={i} className="marquee-item" style={{
                  color: i % 3 === 0 ? 'rgba(0, 247, 255, 0.8)' : i % 3 === 1 ? 'rgba(124, 58, 237, 0.8)' : 'rgba(255, 45, 212, 0.8)'
                }}>
                  {i % 2 === 0 ? '★ ARCADE TIME ★' : '◆ RETRO LEGENDS ◆'}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button with decorative elements */}
          <div className="mt-6 relative">
            {/* Decorative elements around button */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl text-cyan-400 animate-pulse">
              ◆ ◆ ◆
            </div>
            <button 
              onClick={() => navigate('library')} 
              className="cta-button rounded-lg inline-flex items-center justify-center"
            >
              <span className="label">START PLAYING</span>
            </button>
            {/* Bottom decorative elements */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-2xl text-purple-500 animate-pulse">
              ★ ★ ★
            </div>
          </div>
          
          {/* Bottom tagline */}
          <div className="center-tagline mt-4 pt-2">
            <div className="center-title font-press text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-neon.cyan to-neon.purple mb-3">
              START THE RETRO ADVENTURE
            </div>
            <p className="tagline-subtitle text-gray-400 font-mono text-lg">
              Jump in - classics served instantly
            </p>
          </div>
        </div>
      </section>

      {/* Continue Playing Section (always visible; shows lastPlayed or a suggested default) */}
      {(() => {
        let continueGame = lastPlayed || { id: 1, title: 'Pokemon FireRed', console: 'GBA', year: 2004, thumbnail: '🔥', thumbnailImage: '/thumbnails/pokemon_firered.jpg', romPath: '/roms/pokemon_firered.gba' };
        // Patch Pac-Man thumbnail if needed
        if (continueGame.title === 'Pac-Man (Namco)') {
          continueGame = { ...continueGame, thumbnailImage: '/thumbnails/pacman.jpeg' };
        }
        
        return (
          <section 
            ref={continueRef}
            className={`content-section py-12 relative continue-section section-enter-up ${continueVisible ? 'opacity-100' : 'opacity-0'}`}
            onMouseMove={(e) => {
              const section = e.currentTarget
              const rect = section.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              section.style.setProperty('--mouse-x', `${x}px`)
              section.style.setProperty('--mouse-y', `${y}px`)
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.setProperty('--spotlight-opacity', '1')
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--spotlight-opacity', '0')
            }}
            style={{
              '--mouse-x': '50%',
              '--mouse-y': '50%',
              '--spotlight-opacity': '0'
            }}
          >
            {/* Backdrop effects - keeping only grids and ambient flows for subtle distinction */}
            <div className="soft-grid cyan"></div>
            <div className="ambient-flow cyan"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
              <div className="flex items-start justify-between mb-6 section-title-reveal">
                <div>
                  <h3 className="text-3xl font-press text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite] drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                    RESUME YOUR ADVENTURE
                  </h3>
                  <p className="section-sub pulse mt-3 text-gray-300 text-base">
                    Pick up where you left off — your journey awaits.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-400/40 rounded-lg backdrop-blur-sm">
                    <span className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      CONTINUE
                    </span>
                  </div>
                  <span className="text-gray-500 font-mono text-xs">
                    {lastPlayed ? `${new Date(lastPlayed.lastPlayedAt).toLocaleString()}` : 'Start your journey'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 continue-grid">
                <div 
                  className={`game-card-float game-card-tilt transition-all duration-700 ${continueVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: '200ms' }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget
                    const rect = card.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const y = e.clientY - rect.top
                    const centerX = rect.width / 2
                    const centerY = rect.height / 2
                    const rotateX = ((y - centerY) / centerY) * -10
                    const rotateY = ((x - centerX) / centerX) * 10
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)'
                  }}
                >
                  <GameCard 
                    game={continueGame}
                    navigate={navigate}
                    isFavorite={favorites.includes(continueGame.id)}
                    toggleFavorite={toggleFavorite}
                    onPlay={onPlayGame}
                  />
                </div>
              </div>
            </div>
          </section>
        )
      })()}



  {/* Featured Games Section */}
  <section 
    id="featured" 
    ref={featuredRef} 
    className={`content-section py-16 bg-opacity-50 backdrop-blur-sm relative min-h-[70vh] flex items-center featured-section section-enter-up ${featuredVisible ? 'opacity-100' : 'opacity-0'}`}
    onMouseMove={(e) => {
      const section = e.currentTarget
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      section.style.setProperty('--mouse-x', `${x}px`)
      section.style.setProperty('--mouse-y', `${y}px`)
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.setProperty('--spotlight-opacity', '1')
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.setProperty('--spotlight-opacity', '0')
    }}
    style={{
      '--mouse-x': '50%',
      '--mouse-y': '50%',
      '--spotlight-opacity': '0'
    }}
  >
    {/* Backdrop effects - keeping only grids and ambient flows for subtle distinction */}
    <div className="soft-grid purple"></div>
    <div className="ambient-flow purple"></div>
        
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="flex items-start justify-between mb-8 section-title-reveal" style={{ animationDelay: '0.1s' }}>
            <div>
              <h3 className="text-3xl font-press text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite] drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                FEATURED CLASSICS
              </h3>
              <p className="section-sub pulse mt-3 text-gray-300 text-base">Hand‑picked retro hits — spotlighted for instant nostalgia.</p>
            </div>
            <button 
              onClick={() => navigate('library')} 
              className="text-cyan-400 hover:text-white font-mono text-sm font-bold transition-all duration-300 hover:translate-x-2 px-4 py-2 border border-cyan-400/30 hover:border-cyan-400 rounded-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              VIEW ALL →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 featured-games-grid">
            {featuredGames.map((game, index) => (
              <div 
                key={game.id} 
                className={`game-card-float game-card-tilt w-full h-full transition-all duration-700 ${featuredVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ 
                  transitionDelay: featuredVisible ? `${index * 150}ms` : '0ms'
                }}
                onMouseMove={(e) => {
                  const card = e.currentTarget
                  const rect = card.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const centerX = rect.width / 2
                  const centerY = rect.height / 2
                  const rotateX = ((y - centerY) / centerY) * -10
                  const rotateY = ((x - centerX) / centerX) * 10
                  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)'
                }}
              >
                <GameCard
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  toggleFavorite={toggleFavorite}
                  navigate={navigate}
                  onPlay={onPlayGame}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
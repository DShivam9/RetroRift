import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion'
import './HoloCartridge.css'

/**
 * HoloCartridge — A highly interactive 3D CSS game cartridge.
 * Remodeled to adapt its physical proportions and translucent shells dynamically.
 * Features a custom "CRT Laser Scanline & Glitch Deconstruction" Design Spell transition.
 */
export default function HoloCartridge({ activeGame }) {
  const [displayGame, setDisplayGame] = useState(activeGame)
  const prevGameId = useRef(activeGame?.id)
  const [isInserting, setIsInserting] = useState(false)
  
  // Motion values for magnetic mouse tracking
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 })
  const tiltX = useTransform(springY, [0, 1], [15, -15])
  const tiltY = useTransform(springX, [0, 1], [-15, 15])
  const glarePosition = useTransform(springX, [0, 1], ["0%", "100%"])

  // Bespoke Design Spell: High-Fidelity Hardware Snap-In Recoil
  const insertY = useMotionValue(0)
  const insertScaleY = useMotionValue(1)
  const insertRotateX = useMotionValue(0)
  const ledGlow = useMotionValue(0)

  const pcbBg = useTransform(ledGlow, [0, 1], ["rgba(46, 117, 89, 0.08)", "rgba(52, 211, 153, 0.22)"])
  const pcbShadow = useTransform(ledGlow, [0, 1], ["inset 0 0 10px rgba(0, 0, 0, 0.3)", "inset 0 0 15px rgba(52, 211, 153, 0.6), 0 0 20px rgba(52, 211, 153, 0.4)"])

  const combinedRotateX = useTransform([tiltX, insertRotateX], ([tX, iRX]) => tX + iRX)

  // Determine cartridge styling and console shell type
  const getCartridgeTheme = (game) => {
    if (!game) return { type: 'GBA', class: 'cart-gba cart-gba--grey', laserColor: '#8b5cf6' }
    
    const consoleType = (game.console || 'GBA').toUpperCase()
    const title = (game.title || '').toLowerCase()

    if (consoleType === 'GBA') {
      if (title.includes('emerald')) return { type: 'GBA', class: 'cart-gba cart-gba--emerald', laserColor: '#2ecc71' }
      if (title.includes('firered') || title.includes('ruby')) return { type: 'GBA', class: 'cart-gba cart-gba--firered', laserColor: '#e74c3c' }
      if (title.includes('leafgreen') || title.includes('green')) return { type: 'GBA', class: 'cart-gba cart-gba--leafgreen', laserColor: '#2ecc71' }
      if (title.includes('sapphire') || title.includes('blue')) return { type: 'GBA', class: 'cart-gba cart-gba--sapphire', laserColor: '#3498db' }
      return { type: 'GBA', class: 'cart-gba cart-gba--classic', laserColor: '#8b5cf6' }
    }

    if (consoleType === 'GBC') {
      if (title.includes('crystal')) return { type: 'GBC', class: 'cart-gbc cart-gbc--crystal', laserColor: '#00f2fe' }
      if (title.includes('yellow')) return { type: 'GBC', class: 'cart-gbc cart-gbc--yellow', laserColor: '#f1c40f' }
      return { type: 'GBC', class: 'cart-gbc cart-gbc--classic', laserColor: '#8b5cf6' }
    }

    // Default Game Boy Classic (Grey)
    return { type: 'GB', class: 'cart-gb cart-gb--classic', laserColor: '#8b5cf6' }
  }

  const theme = getCartridgeTheme(displayGame)

  useEffect(() => {
    if (activeGame && prevGameId.current !== activeGame.id) {
      // Preload next image immediately
      if (activeGame.thumbnail) {
        const img = new Image()
        img.src = activeGame.thumbnail
      }

      setIsInserting(true)

      // Phase 1: High-Speed Eject Release (Quick pop up & tilt back)
      animate(insertY, -14, { duration: 0.08, ease: "easeOut" })
      animate(insertRotateX, -7, { duration: 0.08, ease: "easeOut" })
      animate(ledGlow, 0.3, { duration: 0.08 })

      // Phase 2: Snap-In Slam & Heavy Kinetic Impact Rebound
      setTimeout(() => {
        // Swap game shell theme & sticker artwork at peak eject
        setDisplayGame(activeGame)
        prevGameId.current = activeGame.id

        // Slam back down with rigid heavy spring
        animate(insertY, 0, {
          type: "spring",
          stiffness: 950,
          damping: 20,
          mass: 0.7
        })

        // Snap rotation back to baseline
        animate(insertRotateX, 0, {
          type: "spring",
          stiffness: 950,
          damping: 20
        })

        // Kinetic impact squash-and-stretch shockwave on scaleY
        animate(insertScaleY, [1, 0.94, 1.015, 1], {
          duration: 0.16,
          ease: "easeInOut",
          onComplete: () => {
            setIsInserting(false)
          }
        })

        // Golden contact pins electric pulse on impact
        animate(ledGlow, [1, 0], {
          duration: 0.22,
          ease: "easeOut"
        })
      }, 80)
    }
  }, [activeGame, insertY, insertScaleY, insertRotateX, ledGlow])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
    mouseY.set(Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)))
  }

  if (!displayGame) return null

  return (
    <div 
      className={`holo-container console-${theme.type.toLowerCase()}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0.5); mouseY.set(0.5); }}
    >
      <motion.div 
        style={{ 
          rotateX: combinedRotateX, 
          rotateY: tiltY, 
          y: insertY,
          scaleY: insertScaleY,
          transformStyle: "preserve-3d" 
        }}
        className="holo-tilt-wrapper"
      >
        <motion.div 
          className={`holo-scene ${theme.class} ${isInserting ? 'is-inserting' : ''}`}
          style={{ 
            transformStyle: "preserve-3d"
          }}
        >
          {/* Main Cartridge Body (Side faces are highly optimized) */}
          <div className="holo-face holo-face--back"></div>
          <div className="holo-face holo-face--left"></div>
          <div className="holo-face holo-face--right"></div>
          <div className="holo-face holo-face--top">
            <div className="holo-detail-lines"></div>
          </div>
          <div className="holo-face holo-face--bottom"></div>

          {/* Front Face of the Cartridge */}
          <div className="holo-face holo-face--front" style={{ transformStyle: "preserve-3d" }}>
            {/* GBA Slanted Top Header Detail */}
            {theme.type === 'GBA' && (
              <div className="gba-header" style={{ transformStyle: "preserve-3d" }}>
                <span className="gba-logo-text">GAME BOY ADVANCE</span>
                <div className="gba-groove"></div>
              </div>
            )}

            {/* GBC Rounded Notch Header Detail */}
            {theme.type === 'GBC' && (
              <div className="gbc-header" style={{ transformStyle: "preserve-3d" }}>
                <span className="gbc-logo-text">GAME BOY COLOR</span>
                <div className="gbc-groove"></div>
              </div>
            )}

            {/* GB Classic Notch Header Detail */}
            {theme.type === 'GB' && (
              <div className="gb-header" style={{ transformStyle: "preserve-3d" }}>
                <span className="gb-logo-text">Nintendo GAME BOY</span>
                <div className="gb-groove"></div>
              </div>
            )}

            {/* Faux Hardware PCB board (glows briefly on impact connection) */}
            {(theme.class.includes('--emerald') || 
              theme.class.includes('--firered') || 
              theme.class.includes('--sapphire') || 
              theme.class.includes('--crystal') ||
              theme.class.includes('--yellow')) && (
              <motion.div 
                className="cartridge-pcb"
                style={{
                  backgroundColor: pcbBg,
                  boxShadow: pcbShadow
                }}
              >
                <div className="pcb-line pcb-line--1"></div>
                <div className="pcb-line pcb-line--2"></div>
                <div className="pcb-chip pcb-chip--rom"></div>
                <div className="pcb-chip pcb-chip--battery"></div>
                <div className="pcb-gold-pins"></div>
              </motion.div>
            )}

            {/* Recessed Sticker Label (clean hardware presentation) */}
            <div className="holo-label">
              <img 
                src={displayGame.thumbnail || '/thumbnails/default-cover.svg'} 
                alt={displayGame.title} 
                className="holo-label__img"
                draggable={false}
              />
              
              <motion.div 
                className="holo-label__glare"
                style={{ backgroundPositionX: glarePosition }}
              />
            </div>

            {/* GBA Embossed Arrow */}
            {theme.type === 'GBA' && (
              <div className="gba-arrow-wrap">
                <div className="gba-arrow"></div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

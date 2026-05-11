import React, { useEffect, useRef } from 'react'
import { Github, Disc, Coffee } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import './Footer.css'

export default function Footer({ navigate }) {
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const currentYear = new Date().getFullYear()
  const canvasRef = useRef(null)

  const pikachu = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif'
  const gengar = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/94.gif'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resize = () => {
      const parent = canvas.parentElement
      if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    // Use ResizeObserver for more reliable sizing in dynamic layouts
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)
    resize()

    // Increased particle density
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * (window.innerWidth || 1000),
      y: Math.random() * 500,
      size: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.3 + 0.1,
      speedX: (Math.random() - 0.5) * 0.1, // Subtle horizontal drift
      opacity: Math.random() * 0.7 + 0.3
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fillRect(star.x, star.y, star.size, star.size)
        star.y -= star.speedY
        star.x += star.speedX
        
        // Loop vertically
        if (star.y < 0) {
          star.y = canvas.height
          star.x = Math.random() * canvas.width
        }
        
        // Loop horizontally bounds
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <footer className="final-footer bg-[#050505] pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      
      {/* High-Visibility Starfield Background */}
      <canvas ref={canvasRef} className="footer-canvas-bg absolute inset-0 pointer-events-none opacity-80" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="flex items-end gap-3">
              <h2 className="text-2xl font-bold tracking-tighter text-white font-orbitron">
                RETRO<span className="text-[#8b5cf6]">RIFT</span>
              </h2>
              <img src={pikachu} alt="" className="w-10 h-10 pixelated mb-1" loading="lazy" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The ultimate destination for classic web-gaming. Preserving the golden era of browser games with a modern, cinematic experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Explore</h3>
              <ul className="flex flex-col gap-3 text-gray-500 text-sm">
                <li><button onClick={() => navigate('library')} className="hover:text-white transition-colors text-left">Popular Games</button></li>
                <li><button onClick={() => navigate('library')} className="hover:text-white transition-colors text-left">Collections</button></li>
                <li><button onClick={() => navigate('library')} className="hover:text-white transition-colors text-left">New Releases</button></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Support</h3>
              <ul className="flex flex-col gap-3 text-gray-500 text-sm">
                <li><button onClick={() => navigate('feedback')} className="hover:text-white transition-colors text-left">Feedback</button></li>
                <li><a href="https://github.com/DShivam9" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Github</a></li>
                <li><button onClick={(e) => { e.preventDefault(); toast.info('Discord server is currently under construction!'); }} className="hover:text-white transition-colors">Discord</button></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6 min-w-[200px]">
            <div className="flex items-center gap-4">
               <img src={gengar} alt="" className="w-12 h-12 pixelated" loading="lazy" />
               <div className="flex gap-2">
                  <a href="https://github.com/DShivam9" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5">
                    <Github size={18} className="text-white" />
                  </a>
                  <button onClick={(e) => { e.preventDefault(); toast.info('Discord server is currently under construction!'); }} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5">
                    <Disc size={18} className="text-white" />
                  </button>
               </div>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); toast.info('Support link being updated for India! Stay tuned.'); }}
              className="flex items-center gap-3 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all text-sm shadow-xl"
            >
              <Coffee size={18} />
              SUPPORT PROJECT
            </button>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-gray-600 text-xs font-pixel">
              © {currentYear} RETRO RIFT. ALL RIGHTS RESERVED.
            </p>
            {!isAuthenticated && (
              <button 
                onClick={() => navigate('login')}
                className="text-[#8b5cf6] text-[10px] font-pixel hover:text-white transition-colors border border-[#8b5cf6]/30 px-4 py-2 hover:bg-[#8b5cf6]/10"
              >
                SIGN_IN / SIGN_UP
              </button>
            )}
          </div>
          <div className="flex gap-6 text-gray-600 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

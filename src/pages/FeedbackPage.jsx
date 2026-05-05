import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare, Bug, Lightbulb, ArrowLeft } from 'lucide-react'
import LineWaves from '../components/LineWaves'
import './FeedbackPage.css'

export default function FeedbackPage({ navigate, user }) {
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    type: 'suggestion',
    message: ''
  })
  const [status, setStatus] = useState('idle') // idle, sending, success, error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    
    const FORMSPREE_ID = 'xrejqalz'

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name || 'Anonymous',
          category: formData.type,
          message: formData.message,
          _subject: `New Feedback: ${formData.type.toUpperCase()}`
        })
      })

      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error('Submission failed:', err)
      setStatus('error')
    }
  }

  return (
    <div className="feedback-page pt-20 pb-12 px-6 relative overflow-hidden">
      
      {/* Background Animation */}
      <div className="feedback-bg">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1}
          rotation={-45}
          edgeFadeWidth={0}
          colorCycleSpeed={1}
          brightness={0.15}
          color1="#8b5cf6"
          color2="#7c3aed"
          color3="#4c1d95"
          enableMouseInteraction={true}
          mouseInfluence={2}
        />
      </div>

      {/* Pokémon Sprites */}
      <div className="feedback-sprites">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif" 
          alt="Squirtle" 
          className="sprite sprite--squirtle"
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif" 
          alt="Bulbasaur" 
          className="sprite sprite--bulbasaur"
        />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {status === 'success' ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="feedback-card feedback-card--success text-center p-12 border-2 border-[#22c55e] rounded-lg bg-black/60 backdrop-blur-xl"
          >
            <div className="w-16 h-16 bg-[#22c55e]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="text-[#22c55e]" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white font-orbitron tracking-tight">THANK YOU</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Your feedback has been captured. We'll review it shortly at <span className="text-white">retroriftmain@gmail.com</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setStatus('idle')
                  setFormData({ ...formData, message: '' })
                }}
                className="px-8 py-3 bg-white/10 text-white font-bold hover:bg-white/20 transition-colors rounded-md text-sm"
              >
                Send Another Message
              </button>
              <button 
                onClick={() => navigate('home')}
                className="px-8 py-3 bg-[#22c55e] text-black font-bold hover:bg-[#16a34a] transition-colors rounded-md text-sm"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-4xl font-bold font-orbitron tracking-tighter mb-2 text-white">
                FEED<span className="text-[#8b5cf6]">BACK</span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                Have a suggestion or found a bug? We'd love to hear from you.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="feedback-form flex flex-col gap-6">
              
              {/* Category Selector */}
              <div className="grid grid-cols-3 gap-3">
                {['suggestion', 'bug', 'other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex flex-col items-center gap-2 p-4 border-2 transition-all rounded-md backdrop-blur-md ${
                      formData.type === type 
                        ? 'border-[#8b5cf6] bg-[#8b5cf6]/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                        : 'border-white/10 bg-black/40 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {type === 'bug' && <Bug size={20} />}
                    {type === 'suggestion' && <Lightbulb size={20} />}
                    {type === 'other' && <MessageSquare size={20} />}
                    <span className="text-[9px] font-bold uppercase tracking-widest">{type}</span>
                  </button>
                ))}
              </div>

              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Your Name (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Alex"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/40 backdrop-blur-md border-2 border-white/10 p-3 text-white outline-none focus:border-[#8b5cf6] transition-colors rounded-md text-sm"
                />
              </div>

              {/* Message Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Your Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="How can we improve?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-black/40 backdrop-blur-md border-2 border-white/10 p-3 text-white outline-none focus:border-[#8b5cf6] transition-colors resize-none rounded-md text-sm"
                ></textarea>
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm text-center font-medium">Failed to send message. Please try again.</p>
              )}

              <button 
                type="submit"
                disabled={status === 'sending'}
                className={`flex items-center justify-center gap-3 p-5 font-bold transition-all rounded-md shadow-2xl ${
                  status === 'sending' 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-[#8b5cf6]/20'
                }`}
              >
                {status === 'sending' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Feedback
                  </>
                )}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  )
}

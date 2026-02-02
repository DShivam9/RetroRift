import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import './Toast.css'

// Toast Context
const ToastContext = createContext(null)

// Sound frequencies for pleasing retro sounds
const SOUNDS = {
    success: { frequency: 880, duration: 100, type: 'sine', pattern: [1, 0.5, 1.5] },
    error: { frequency: 220, duration: 200, type: 'sawtooth', pattern: [1, 1] },
    info: { frequency: 660, duration: 80, type: 'sine', pattern: [1, 1.2] },
    warning: { frequency: 440, duration: 150, type: 'triangle', pattern: [1, 0.8, 1] }
}

// Play a pleasant retro sound
function playSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return

        const ctx = new AudioContext()
        const sound = SOUNDS[type] || SOUNDS.info

        sound.pattern.forEach((multiplier, index) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.type = sound.type
            oscillator.frequency.value = sound.frequency * multiplier

            const startTime = ctx.currentTime + (index * sound.duration / 1000)
            const endTime = startTime + (sound.duration / 1000)

            gainNode.gain.setValueAtTime(0.15, startTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)

            oscillator.start(startTime)
            oscillator.stop(endTime)
        })
    } catch (e) {
        // Silently fail if audio not available
    }
}

// Toast Provider Component
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const toastIdRef = useRef(0)

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = ++toastIdRef.current

        // Play sound
        playSound(type)

        setToasts(prev => [...prev, { id, message, type }])

        // Auto remove
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration)
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

// Individual Toast
function Toast({ message, type, onClose }) {
    const [isExiting, setIsExiting] = useState(false)

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(onClose, 200)
    }

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    }

    return (
        <div className={`toast toast--${type} ${isExiting ? 'toast--exit' : ''}`}>
            <span className="toast__icon">{icons[type]}</span>
            <span className="toast__message">{message}</span>
            <button className="toast__close" onClick={handleClose}>×</button>
        </div>
    )
}

export default Toast

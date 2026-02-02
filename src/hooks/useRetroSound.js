import { useCallback, useRef } from 'react'

/**
 * useRetroSound - Generates synthesized arcade SFX using Web Audio API
 * No external files required.
 */
export function useRetroSound() {
    const audioCtxRef = useRef(null)

    // Initialize context lazily on first interaction
    const getContext = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (AudioContext) {
                audioCtxRef.current = new AudioContext()
            }
        }
        return audioCtxRef.current
    }

    const playTone = (freq, type, duration, vol = 0.1) => {
        const ctx = getContext()
        if (!ctx) return

        // Resume if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume()
        }

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)

        gain.gain.setValueAtTime(vol, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + duration)
    }

    const playHover = useCallback(() => {
        // High pitch, short tick
        playTone(800, 'sine', 0.05, 0.05)
    }, [])

    const playClick = useCallback(() => {
        // Punchy square wave
        playTone(300, 'triangle', 0.1, 0.1)
    }, [])

    const playSuccess = useCallback(() => {
        // Coin sound
        const ctx = getContext()
        if (!ctx) return
        const now = ctx.currentTime

        // Low
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.frequency.setValueAtTime(900, now)
        gain1.gain.setValueAtTime(0.1, now)
        gain1.gain.linearRampToValueAtTime(0, now + 0.1)
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start()
        osc1.stop(now + 0.1)

        // High
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.frequency.setValueAtTime(1400, now + 0.05)
        gain2.gain.setValueAtTime(0.1, now + 0.05)
        gain2.gain.linearRampToValueAtTime(0, now + 0.4)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(now + 0.05)
        osc2.stop(now + 0.4)
    }, [])

    return { playHover, playClick, playSuccess }
}

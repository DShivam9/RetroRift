import { useCallback, useRef } from 'react'

export function useRetroAudio() {
    const audioCtxMain = useRef(null)

    const getSfxVolume = () => {
        try {
            const custom = JSON.parse(localStorage.getItem('retroPlay_custom'))
            if (custom && custom.sfxVolume !== undefined) return custom.sfxVolume
        } catch (e) { }
        return 60 // Default fallback
    }

    const initAudio = () => {
        if (!audioCtxMain.current) {
            try {
                audioCtxMain.current = new (window.AudioContext || window.webkitAudioContext)()
            } catch (e) { }
        }
    }

    const playBlip = useCallback(() => {
        initAudio()
        const volPct = getSfxVolume()
        if (!audioCtxMain.current || volPct <= 0) return
        const ctx = audioCtxMain.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        // Soft high tick
        osc.frequency.setValueAtTime(1200, ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime((volPct / 100) * 0.05, ctx.currentTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.06)
    }, [])

    const playClick = useCallback(() => {
        initAudio()
        const volPct = getSfxVolume()
        if (!audioCtxMain.current || volPct <= 0) return
        const ctx = audioCtxMain.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        // Soft low thump
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime((volPct / 100) * 0.08, ctx.currentTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
    }, [])

    const playTabSwitch = useCallback(() => {
        initAudio()
        const volPct = getSfxVolume()
        if (!audioCtxMain.current || volPct <= 0) return
        const ctx = audioCtxMain.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        // Soft sweeping whoosh
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime((volPct / 100) * 0.04, ctx.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
    }, [])

    return { playBlip, playClick, playTabSwitch }
}

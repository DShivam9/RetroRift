import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
    // --- Audio Settings ---
    const [audioEnabled, setAudioEnabled] = useState(() => {
        return localStorage.getItem('audio_enabled') !== 'false'
    })

    const [musicVolume, setMusicVolume] = useState(() => {
        return Number(localStorage.getItem('music_volume') || 0.5)
    })

    // --- Visual Settings ---
    const [crtMode, setCrtMode] = useState(() => {
        return localStorage.getItem('crt_mode') === 'true'
    })

    const [scanlines, setScanlines] = useState(() => {
        return localStorage.getItem('scanlines') === 'true'
    })

    const [reducedMotion, setReducedMotion] = useState(() => {
        return localStorage.getItem('reduced_motion') === 'true'
    })

    // --- Persist Settings ---
    useEffect(() => {
        localStorage.setItem('audio_enabled', audioEnabled)
        localStorage.setItem('music_volume', musicVolume)
        localStorage.setItem('crt_mode', crtMode)
        localStorage.setItem('scanlines', scanlines)
        localStorage.setItem('reduced_motion', reducedMotion)

        if (crtMode) document.body.classList.add('crt-active')
        else document.body.classList.remove('crt-active')

        if (scanlines) document.body.classList.add('scanlines-active')
        else document.body.classList.remove('scanlines-active')

        if (reducedMotion) document.body.classList.add('reduced-motion')
        else document.body.classList.remove('reduced-motion')

    }, [audioEnabled, musicVolume, crtMode, scanlines, reducedMotion])

    // --- Actions ---
    const refreshSettings = () => {
        setAudioEnabled(localStorage.getItem('audio_enabled') !== 'false')
        setMusicVolume(Number(localStorage.getItem('music_volume') || 0.5))
        setCrtMode(localStorage.getItem('crt_mode') === 'true')
        setScanlines(localStorage.getItem('scanlines') === 'true')
        setReducedMotion(localStorage.getItem('reduced_motion') === 'true')
    }

    const clearAllData = () => {
        localStorage.clear()
        window.location.reload()
    }

    const value = {
        audioEnabled,
        setAudioEnabled,
        musicVolume,
        setMusicVolume,
        crtMode,
        setCrtMode,
        scanlines,
        setScanlines,
        reducedMotion,
        setReducedMotion,
        refreshSettings,
        clearAllData
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

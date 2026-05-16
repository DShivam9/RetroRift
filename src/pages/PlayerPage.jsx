import React, { useState, useRef, useEffect, useCallback } from 'react'
import GBAEmulator from '../lib/gba-emulator'
import { Loader } from '../components/Loader'
import SaveNameModal from '../components/SaveNameModal'
import { games } from '../data/games'
import { useAuth } from '../context/AuthContext'
import { saveGameState, getGameSaveMetadata, downloadSaveState, deleteSaveState } from '../lib/cloudSaves'
import { onPlayTimeRecorded } from '../lib/xpEngine'
import { sanitizeSaveName } from '../lib/inputSanitizer'
import UploadRomArea from '../components/UploadRomArea'
import {
  Save, FolderOpen, Trash2, ChevronRight, Star, Clock, RefreshCw,
  Gamepad2, Calendar, MapPin, Zap, Heart, Play, Volume2, Cloud, CloudOff, AlertTriangle, Edit3, LogIn,
  Cpu, ShieldCheck, Info, HardDrive, BookOpen, Trophy, Share2, Monitor
} from 'lucide-react'
import ShinyText from '../components/ShinyText'
import '../styles/components.css'
import './PlayerPage.css'
import { getCachedROM, setCachedROM, deleteCachedROM } from '../lib/rom-cache'

/**
 * PlayerPage - Enhanced Emulator Page
 * Game details now come directly from the auto-generated catalog (games.js)
 */
export default function PlayerPage({ navigate, game, favorites = [], toggleFavorite, onPlayGame, xpData, setXpData }) {
  // Enhanced state management: Synchronize prop with fresh catalog data to avoid staleness
  const [syncedGame, setSyncedGame] = useState(() => {
    const initial = game || { title: 'Select a Game', console: 'N/A', year: '----', romPath: null }
    if (initial.id) {
      return games.find(g => g.id === initial.id) || initial
    }
    return initial
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 900px)').matches)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Self-healing effect: Re-sync whenever the game prop changes
  useEffect(() => {
    if (game?.id) {
      const fresh = games.find(g => g.id === game.id)
      if (fresh) {
        setSyncedGame(fresh)
      } else {
        setSyncedGame(game)
      }
    }
  }, [game])

  const currentGame = syncedGame
  const details = {
    description: currentGame.description || 'A classic gaming experience.',
    region: currentGame.console || 'Unknown',
    genre: currentGame.genre || 'Game',
    developer: currentGame.developer || 'Unknown',
    difficulty: currentGame.difficulty || 'Unknown',
    playtime: currentGame.playtime || 'Varies',
    rating: currentGame.rating || 4.0,
    features: currentGame.features || []
  }



  const [loading, setLoading] = useState(true)
  const [isEngineReady, setIsEngineReady] = useState(false)
  const [error, setError] = useState(null)
  const [playtime, setPlaytime] = useState(0)
  const playtimeRef = useRef(0)
  const [romData, setRomData] = useState(null)
  const [saveSlots, setSaveSlots] = useState([])
  const saveDataCache = useRef({}) // Persistent non-reactive cache for binary save data
  const [saveMessage, setSaveMessage] = useState('')
  const [savingToCloud, setSavingToCloud] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveModalMode, setSaveModalMode] = useState(null) // 'new' | { type: 'rename', saveId }
  const [saveModalDefault, setSaveModalDefault] = useState('')
  const [downloadingSave, setDownloadingSave] = useState(null) // saveId of slot being downloaded
  const canvasRef = useRef(null)
  const emulatorRef = useRef(null)
  const isInitializingRef = useRef(false)
  const isComponentMounted = useRef(true)
  const intervalRef = useRef(null)
  const { user, isAuthenticated } = useAuth()
  const [shareStatus, setShareStatus] = useState(null) // null | 'copied' | 'error'

  const handleShare = async () => {
    if (!currentGame || !currentGame.id) return

    try {
      const slug = currentGame.title.toLowerCase().replace(/ /g, '-')
      const shareUrl = `${window.location.origin}/play/${slug}`
      await navigator.clipboard.writeText(shareUrl)
      setShareStatus('copied')
      setTimeout(() => setShareStatus(null), 2000)
    } catch (err) {
      setShareStatus('error')
      setTimeout(() => setShareStatus(null), 2000)
    }
  }

  const MAX_SAVE_SLOTS = 5

  // Simple games don't support save states (e.g. Pac-Man, Tetris)
  const NON_SAVE_GENRES = ['Arcade', 'Puzzle', 'Sports']
  const isEndless = details.playtime?.toLowerCase().includes('endless')
  const supportsSaves = (currentGame.romPath || currentGame.requiresUpload || currentGame.externalUrl) && !NON_SAVE_GENRES.includes(details.genre) && !isEndless

  const isFavorite = favorites?.includes(currentGame.id)

  // Get similar games (same console or genre)
  const similarGames = games.filter(g =>
    g.id !== currentGame.id &&
    (g.console === currentGame.console ||
      g.genre === details.genre)
  ).slice(0, 4)

  // Ensure page starts at top on every mount (Aggressive Reset)
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0)
    // Secondary fallback for slow layout shifts
    const timer = setTimeout(() => window.scrollTo(0, 0), 10)
    return () => clearTimeout(timer)
  }, [currentGame.id])

  // Load existing save slots (local + cloud, only for games that support saves)
  useEffect(() => {
    if (!supportsSaves) return
    const loadSaves = async () => {
      // Always load from localStorage first (has actual stateData)
      if (currentGame.id) {
        const saved = localStorage.getItem(`saves_${currentGame.id}`)
        if (saved) {
          try {
            setSaveSlots(JSON.parse(saved))
          } catch { /* ignore bad JSON */ }
        }
      }
      // Then merge metadata from cloud
      if (currentGame.id && isAuthenticated && user?.uid) {
        try {
          const cloudData = await getGameSaveMetadata(user.uid, currentGame.id)
          if (cloudData?.slots) {
            // Merge cloud metadata with local stateData
            setSaveSlots(prev => {
              const localSlots = [...prev]
              const cloudSlots = cloudData.slots

              // Create a map for quick lookup
              const merged = [...cloudSlots]
              
              // Add local slots that aren't in the cloud yet
              localSlots.forEach(ls => {
                const cloudIndex = merged.findIndex(cs => cs.id === ls.id)
                if (cloudIndex !== -1) {
                   // Update cloud metadata with local stateData if available
                   merged[cloudIndex] = { ...merged[cloudIndex], stateData: ls.stateData || merged[cloudIndex].stateData || null }
                } else {
                   // Keep local only slot
                   merged.push(ls)
                }
              })
              
              return merged.sort((a, b) => (b.id || 0) - (a.id || 0)) // Sort by newest
            })
          }
        } catch (err) {
          // Silence noise for production
        }
      }
    }
    loadSaves()
  }, [currentGame.id, isAuthenticated, user?.uid, supportsSaves])
  
  // Safety Lock: Prevent closing the window while saving to cloud
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (savingToCloud) {
        const msg = 'Save in progress. Closing the window now may result in data loss.';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [savingToCloud]);

  // Prevent arrow keys / game keys from scrolling the page while emulator is active
  useEffect(() => {
    const GAME_KEYS = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      ' ', 'Space', 'Enter', 'Shift', 'Tab',
      'x', 'X', 'z', 'Z', 'a', 'A', 's', 'S'
    ]
    const preventScroll = (e) => {
      if (emulatorRef.current && GAME_KEYS.includes(e.key)) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', preventScroll, { passive: false })
    return () => window.removeEventListener('keydown', preventScroll)
  }, [])

  // Track real play time
  const playStartRef = useRef(Date.now())
  useEffect(() => {
    playStartRef.current = Date.now()
    return () => {
      const elapsedMs = Date.now() - playStartRef.current
      const elapsedMin = elapsedMs / 60000
      if (elapsedMin >= 0.5 && setXpData) {
        setXpData(prev => onPlayTimeRecorded(prev, elapsedMin))
      }
    }
  }, [setXpData])

  // Load ROM with fallback proxies
  const loadROM = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!currentGame.romPath && !currentGame.externalUrl && currentGame.requiresUpload) {
        setLoading(false)
        return
      }

      // Check Cache First
      if (currentGame.externalUrl) {
        const cachedData = await getCachedROM(currentGame.id)
        if (cachedData) {
          const consoleType = currentGame.console?.toUpperCase()
          // Use the same dynamic thresholds as the fetcher
          let minSize = 10000
          if (consoleType === 'NDS') minSize = 8000000
          if (consoleType === 'GBA') minSize = 2000000
          if (consoleType === 'SNES') minSize = 500000
          if (consoleType === 'GBC' || consoleType === 'GB') minSize = 100000

          if (cachedData.byteLength >= minSize) {
            console.log(`[Player] Using cached ROM data (${cachedData.byteLength} bytes)`)
            setRomData(cachedData)
            setLoading(false)
            return
          } else {
            console.warn(`[Player] Cached ROM is truncated (${cachedData.byteLength} bytes). Purging and re-downloading...`)
            // Continue to download
          }
        }
      }

      // Local ROM fallback
      if (currentGame.romPath && !currentGame.externalUrl) {
        try {
          const response = await fetch(encodeURI(currentGame.romPath))
          if (response.ok) {
            const data = await response.arrayBuffer()
            setRomData(data)
            setLoading(false)
            return
          }
        } catch (e) {
          console.warn('[Player] Local ROM fetch failed')
        }
      }

      const proxies = [
        { name: 'InternalProxy', fn: (url) => `/api/proxy?url=${encodeURIComponent(url)}`, type: 'raw' },
        { name: 'Direct', fn: (url) => url, type: 'raw' },
        { name: 'AllOriginsJSON', fn: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' },
        { name: 'CorsProxyIO', fn: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`, type: 'raw' }
      ]

      let lastError = null
      let success = false
      const consoleType = currentGame.console?.toUpperCase()

      for (const proxy of proxies) {
        try {
          const cleanUrl = decodeURIComponent(currentGame.externalUrl)
          const proxyUrl = proxy.fn(cleanUrl)
          console.log(`[Player] Attempting ${proxy.name} fetch (${proxy.type})...`)
          
          const controller = new AbortController()
          // 10 MINUTE TIMEOUT: Archive.org is heavily throttled for NDS files.
          const timeoutMs = consoleType === 'NDS' ? 600000 : 180000
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
          
          const response = await fetch(proxyUrl, { 
            signal: controller.signal,
            mode: proxy.name === 'Direct' ? 'cors' : 'cors'
          })
          
          if (response.ok) {
            let data;
            if (proxy.type === 'json') {
              console.log('[Player] Proxy returned metadata, decoding base64...');
              const json = await response.json()
              if (!json.contents) throw new Error('Proxy returned empty contents')
              
              const base64 = json.contents.split(',')[1] || json.contents
              const binaryString = window.atob(base64)
              const len = binaryString.length
              const bytes = new Uint8Array(len)
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }
              data = bytes.buffer
            } else {
              data = await response.arrayBuffer()
            }
            
            clearTimeout(timeoutId)
            const size = data.byteLength
            const uint8 = new Uint8Array(data)
            
            // ZIP INTEGRITY CHECK
            let isZip = uint8[0] === 0x50 && uint8[1] === 0x4B && uint8[2] === 0x03 && uint8[3] === 0x04
            if (isZip && size > 100) {
              let foundEOCD = false
              const scanRange = Math.min(size, 2048)
              for (let i = size - 4; i > size - scanRange && i >= 0; i--) {
                if (uint8[i] === 0x50 && uint8[i+1] === 0x4B && uint8[i+2] === 0x05 && uint8[i+3] === 0x06) {
                  foundEOCD = true
                  break
                }
              }
              if (!foundEOCD) {
                console.warn(`[Player] ${proxy.name} data is truncated (${size} bytes). Trying next...`)
                continue
              }
            }

            // DYNAMIC THRESHOLD
            let minSize = 100000
            if (consoleType === 'NDS') minSize = 25000000
            if (consoleType === 'GBA') minSize = 2000000
            
            if (size < minSize) {
              console.warn(`[Player] ${proxy.name} payload too small (${size} bytes). Trying next...`)
              continue
            }

            console.log(`[Player] ✅ ${proxy.name} Success: ${size} bytes received.`)
            setRomData(data)
            
            try {
              await setCachedROM(currentGame.id, data)
              console.log('[Player] ROM cached locally.')
            } catch (cacheErr) {}
            
            success = true
            setLoading(false)
            break
          } else {
            clearTimeout(timeoutId)
            console.warn(`[Player] ${proxy.name} HTTP Error: ${response.status}`)
          }
        } catch (err) {
          console.warn(`[Player] ${proxy.name} failed: ${err.message}`)
          lastError = err
        }
      }

      if (!success) {
        setLoading(false)
        const isTimeout = lastError?.name === 'AbortError'
        setError(isTimeout 
          ? 'The download is taking too long (Archive.org throttling). Please try again or upload your own ROM.' 
          : 'Archive.org is currently blocking all access. Please try the "Force Refresh" button or upload a ROM.')
        return
      }
    } catch (err) {
      console.error('[Player] loadROM fatal error:', err)
      setError('An unexpected error occurred while loading the game.')
      setLoading(false)
    }
  }, [currentGame])

  // Trigger ROM load on mount or game change
  useEffect(() => {
    if (currentGame.id) {
      console.log(`[Player] Game active: ${currentGame.title} (${currentGame.id})`)
      
      if (isMobile) {
        console.log('[Player] Mobile device detected. Skipping heavy WASM engine initialization.')
        setLoading(false)
        return
      }

      // CRITICAL: Clean up existing emulator before switching games
      if (emulatorRef.current) {
        console.log('[Player] Destroying stale emulator instance...')
        emulatorRef.current.destroy()
        emulatorRef.current = null
      }

      // Reset state
      setRomData(null)
      setError(null)
      setLoading(true)
      
      // Load ROM
      loadROM()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame.id, isMobile]) // ONLY depend on ID and isMobile to prevent loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (emulatorRef.current) {
        emulatorRef.current.destroy()
        emulatorRef.current = null
      }
    }
  }, [])

  // Handle page-level details and playtime
  useEffect(() => {
    if (currentGame.id) {
      window.scrollTo(0, 0)
      
      if (intervalRef.current) clearInterval(intervalRef.current)
      
      intervalRef.current = setInterval(() => {
        setPlaytime(t => {
          const next = t + 1
          playtimeRef.current = next
          return next
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (playtimeRef.current > 0 && setXpData) {
        setXpData(prev => onPlayTimeRecorded(prev, playtimeRef.current / 60))
      }
    }
  }, [currentGame.id, setXpData])

  // Initialize emulator after ROM loads
  useEffect(() => {
    // We wait for loading to be false to ensure the canvas has been rendered in the DOM
    if (!loading && romData && canvasRef.current && !emulatorRef.current) {
      const initEmulator = async () => {
        if (isInitializingRef.current) return
        isInitializingRef.current = true
        
        try {
          let system = 'gba'
          const rawConsole = currentGame.console ? currentGame.console.toUpperCase() : ''
          
          if (rawConsole === 'NES') system = 'fceumm'
          if (rawConsole === 'SNES') system = 'snes9x'
          if (rawConsole === 'SEGACD') system = 'genesis_plus_gx'
          if (rawConsole === 'NDS') system = 'melonds'
          if (rawConsole === 'GB' || rawConsole === 'GBC' || rawConsole === 'GBA') system = 'mgba'

          console.log(`[Player] Initializing emulator with system: ${system} (for console: ${rawConsole})`)
          
          // Small delay to ensure canvas is fully ready/sized in the layout
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (!canvasRef.current) return

          // Pass currentGame.id for better persistence and resolve the "gameId not set" warning
          emulatorRef.current = new GBAEmulator(canvasRef.current, system, currentGame.id)
          
          // Track engine start with a timeout for feedback only
          const startTimeout = setTimeout(() => {
            if (isComponentMounted.current && !isEngineReady) {
              console.warn('[Player] Engine initialization is taking longer than expected...')
              // We don't force it anymore; the polling in gba-emulator will eventually trigger onStart
            }
          }, 20000) 

          const loadSuccess = await emulatorRef.current.loadROM(romData, () => {
            clearTimeout(startTimeout)
            if (isComponentMounted.current && !isEngineReady) {
              console.log('[Player] Engine active! Dismissing loader.')
              setIsEngineReady(true)
              setLoading(false)
            }
          })
          
          if (loadSuccess) {
            emulatorRef.current.start()
            console.log('[Player] Emulator initialization call completed successfully')
          } else {
            console.error('[Player] Emulator loadROM returned false');
            setError('The game engine failed to initialize the ROM data. This could be due to a corrupted file or CDN bottleneck.');
            setLoading(false);
            
            // AUTO-PURGE: If load failed, the ROM data might be bad. Purge it so next try is clean.
            try {
              await deleteCachedROM(currentGame.id);
              console.warn(`[Player] ROM cache purged for ${currentGame.id} due to load failure.`);
            } catch (e) {}
          }
        } catch (err) {
          console.error('[Player] Emulator init error:', err)
          setError('Failed to start emulator. Please refresh and try again.')
          isInitializingRef.current = false
        }
      }
      initEmulator()
    }
  }, [romData, currentGame.console, loading])

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Save state handlers — requires auth
  const handleSaveState = () => {
    if (!isAuthenticated) {
      setSaveMessage('Sign in to save your progress')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }
    if (!emulatorRef.current) {
      setSaveMessage('Emulator not ready')
      setTimeout(() => setSaveMessage(''), 2000)
      return
    }
    if (saveSlots.length >= MAX_SAVE_SLOTS) {
      setSaveMessage(`Max ${MAX_SAVE_SLOTS} saves! Delete one first.`)
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }
    // Open themed modal instead of prompt()
    setSaveModalMode('new')
    setSaveModalDefault(`Save ${saveSlots.length + 1}`)
    setSaveModalOpen(true)
  }

  // Called when user confirms save name from modal
  const handleSaveConfirm = async (rawName) => {
    setSaveModalOpen(false)
    const saveName = sanitizeSaveName(rawName)

    if (saveModalMode === 'new') {
      try {
        setSavingToCloud(true)
        setSaveMessage('Capturing game state...')
        const stateData = await emulatorRef.current.saveState()

        if (!stateData) {
          setSaveMessage('Could not capture game state — try playing for a few more seconds')
          setTimeout(() => setSaveMessage(''), 4000)
          setSavingToCloud(false)
          return
        }

        const newSave = {
          id: Date.now().toString(),
          slot: saveSlots.length + 1,
          name: saveName || `Save ${saveSlots.length + 1}`,
          date: new Date().toLocaleString(),
          playtime: formatTime(playtime),
          isSynced: false
        }

        // Store binary in stealth cache (Non-reactive)
        saveDataCache.current[newSave.id] = stateData

        const updatedSlots = [newSave, ...saveSlots]
        setSaveSlots(updatedSlots)

        // Cache metadata to localStorage (Fast)
        localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(updatedSlots))

        if (isAuthenticated && user?.uid) {
          try {
            setSaveMessage('Saving... Don\'t close window!')
            const cloudSlots = await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
            if (cloudSlots) {
              setSaveSlots(cloudSlots)
              localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(cloudSlots))
            }
            setSaveMessage('Synced to cloud! ☁️')
          } catch (err) {
            console.error('[SaveFlow] ❌ Cloud sync failed:', err.message)
            setSaveMessage(err.message.includes('1MB') ? 'Saved locally (too large)' : 'Saved locally (failed)')
          }
        } else {
          setSaveMessage('Saved locally')
        }
        setTimeout(() => setSaveMessage(''), 4000)
      } catch (error) {
        console.error('[SaveFlow] ❌ Save error:', error)
        setSaveMessage('Save failed — try again')
        setTimeout(() => setSaveMessage(''), 4000)
      } finally {
        setSavingToCloud(false)
      }
    } else if (saveModalMode?.type === 'rename') {
      const updatedSlots = saveSlots.map(s =>
        s.id === saveModalMode.saveId ? { ...s, name: saveName } : s
      )
      setSaveSlots(updatedSlots)
      const metaOnly = updatedSlots.map(s => ({ ...s, stateData: null }))
      localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaOnly))
      if (isAuthenticated && user?.uid) {
        saveGameState(user.uid, currentGame.id, { slots: updatedSlots }).catch(() => { })
      }
    }
  }

  const handleLoadState = async (save) => {
    // 1. Check stealth cache first
    let stateToLoad = saveDataCache.current[save.id]

    // CRITICAL: If stateToLoad is a plain object '{}', it's corrupted data from a previous 
    // failed localStorage save attempt. We must ignore it and force a cloud fetch.
    if (stateToLoad && typeof stateToLoad === 'object' && 
        !(stateToLoad instanceof Uint8Array) && 
        !(stateToLoad instanceof ArrayBuffer) &&
        stateToLoad.constructor?.name === 'Object') {
      console.warn('[LoadFlow] ⚠️ Detected corrupted local save data, forcing cloud fetch.')
      stateToLoad = null
    }

    // If data isn't local, download it from Firestore
    if (!stateToLoad && save.isSynced && isAuthenticated) {
      try {
        setDownloadingSave(save.id)
        setSaveMessage(`Fetching cloud save: ${save.name}...`)
        
        // Add a safety timeout for the download
        const downloadPromise = downloadSaveState(user.uid, currentGame.id, save.id)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cloud download timed out')), 10000)
        )

        const downloadedData = await Promise.race([downloadPromise, timeoutPromise])
        
        if (downloadedData) {
          stateToLoad = downloadedData
          setSaveMessage('Cloud save ready!')
          // Give the browser a moment to breathe and update the UI before the heavy engine work
          await new Promise(resolve => setTimeout(resolve, 150))
        }
      } catch (err) {
        console.error('Cloud download failed:', err)
        setSaveMessage(err.message === 'Cloud download timed out' ? 'Connection timed out' : 'Failed to fetch cloud save')
        setDownloadingSave(null)
        setTimeout(() => setSaveMessage(''), 3000)
        return
      } finally {
        setDownloadingSave(null)
      }
    }

    // Now check if we can actually load it into the emulator
    if (!emulatorRef.current) {
      setSaveMessage('Start the game first before loading a save')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    if (!stateToLoad) {
      setSaveMessage('Save data not found (locally or in cloud)')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      // Basic integrity check before passing to engine
      if (!stateToLoad || (stateToLoad.byteLength < 100 && typeof stateToLoad !== 'string')) {
        throw new Error('Save data is too small or corrupted')
      }

      setSaveMessage('Injecting state...')
      // Final breather for UI responsiveness
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('[LoadFlow] Injecting state into emulator engine...')
      const loaded = await emulatorRef.current.loadState(stateToLoad)
      if (loaded) {
        setSaveMessage(`Successfully Loaded: ${save.name}`)
      } else {
        setSaveMessage('Engine Error: Incompatible save file')
      }
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Load state error:', err)
      setSaveMessage('Error: Save file corrupted')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleOverwriteSave = async (saveId) => {
    if (!emulatorRef.current) {
      setSaveMessage('Start the game first before overwriting')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      setSavingToCloud(true)
      setSaveMessage('Saving... Don\'t close window!')
      const stateData = await emulatorRef.current.saveState()

      if (!stateData) {
        setSaveMessage('Could not capture game state — try again')
        setTimeout(() => setSaveMessage(''), 3000)
        setSavingToCloud(false)
        return
      }

      saveDataCache.current[saveId] = stateData

      const updatedSlots = saveSlots.map(s =>
        s.id === saveId
          ? { ...s, date: new Date().toLocaleString(), playtime: formatTime(playtime), isSynced: false }
          : s
      )
      setSaveSlots(updatedSlots)
      
      const metaOnly = updatedSlots.map(s => ({ ...s, stateData: null }))
      localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaOnly))

      // Re-upload to cloud
      if (isAuthenticated && user?.uid) {
        try {
          const cloudSlots = await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
          if (cloudSlots) {
            const mergedSlots = cloudSlots.map(cs => {
              const local = updatedSlots.find(l => l.id === cs.id)
              return { ...cs, stateData: local?.stateData || null }
            })
            setSaveSlots(mergedSlots)
            const metaForStorage = mergedSlots.map(s => ({ ...s, stateData: null }))
            try { localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaForStorage)) } catch { /* ignore */ }
          }
          setSaveMessage('Save overwritten! ☁️')
        } catch (err) {
          console.error('Cloud overwrite failed:', err)
          if (err.message.includes('1MB')) {
            setSaveMessage('Overwritten locally (save too large for cloud)')
          } else {
            setSaveMessage('Overwritten locally (cloud sync failed)')
          }
        }
      } else {
        setSaveMessage('Save overwritten locally')
      }
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Overwrite error:', error)
      setSaveMessage('Overwrite failed')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSavingToCloud(false)
    }
  }

  const handleDeleteSave = async (saveId) => {
    const updatedSlots = saveSlots.filter(s => s.id !== saveId)
    setSaveSlots(updatedSlots)
    const metaOnly = updatedSlots.map(s => ({ ...s, stateData: null }))
    localStorage.setItem(`saves_${currentGame.id}`, JSON.stringify(metaOnly))

    // Sync deletion to cloud (metadata + binary)
    if (isAuthenticated && user?.uid) {
      try {
        await saveGameState(user.uid, currentGame.id, { slots: updatedSlots })
        await deleteSaveState(user.uid, currentGame.id, saveId)
      } catch (err) {
        console.error('Cloud delete sync failed:', err)
      }
    }
  }

  const handleRenameSave = (saveId) => {
    const save = saveSlots.find(s => s.id === saveId)
    if (!save) return
    // Open themed modal for rename
    setSaveModalMode({ type: 'rename', saveId })
    setSaveModalDefault(save.name || `Save ${save.slot}`)
    setSaveModalOpen(true)
  }

  // Render stars
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= Math.round(rating) ? 'star--filled' : 'star--empty'}
        />
      )
    }
    return stars
  }

  const handleForceRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteCachedROM(currentGame.id);
      console.log(`[Player] Manual cache purge triggered for ${currentGame.id}`);
      loadROM();
    } catch (e) {
      loadROM();
    }
  };

  return (
    <div className="player-page">
      {/* Breadcrumb */}
      <nav className="player-breadcrumb">
        <button onClick={() => navigate('home')}>Home</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate('library')}>Games</button>
        <ChevronRight size={14} />
        <span>{currentGame.title}</span>
      </nav>

      <div className="player-layout">
        {/* Main Content */}
        <div className="player-main">
          {/* Game Title & Actions */}
          <div className="player-header">
            <div className="player-header__left">
              <h1 className="player-title">
                <ShinyText
                  text={currentGame.title}
                  speed={3}
                  color="#ffffff"
                  shineColor="#8b5cf6"
                />
              </h1>
              <div className="player-rating">
                {renderStars(details.rating)}
                <span className="player-rating__value">{details.rating}</span>
              </div>
            </div>
            <div className="player-header__actions">
              <button
                className={`player-action-btn ${shareStatus === 'copied' ? 'player-action-btn--success' : ''}`}
                onClick={handleShare}
                title="Share Game"
              >
                {shareStatus === 'copied' ? (
                  <ShieldCheck size={18} className="text-emerald-400" />
                ) : (
                  <Share2 size={18} />
                )}
                {shareStatus === 'copied' && <span className="player-share-toast">Link Copied!</span>}
              </button>
              {toggleFavorite && (
                <button
                  className={`player-action-btn ${isFavorite ? 'player-action-btn--active' : ''}`}
                  onClick={() => toggleFavorite(currentGame.id)}
                  title="Add to Favorites"
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>

          {/* Emulator Frame - V3 Cinematic */}
          <div className="player-emulator">
            <div className="player-emulator__label">
              <span className="player-emulator__label-text">System Status: Active</span>
              <div className="player-emulator__leds">
                <div className="player-led player-led--power"></div>
                <div className="player-led player-led--activity"></div>
              </div>
            </div>
            
            <div className="player-frame">
              {error ? (
                <div className="player-error">
                  <span>⚠️</span>
                  <p>{error}</p>
                  <div className="player-error__actions">
                    <button onClick={loadROM} className="btn btn--secondary">Retry</button>
                    <button onClick={handleForceRefresh} className="btn btn--ghost">Clear Cache & Refresh</button>
                  </div>
                  {currentGame.externalUrl && (
                    <div className="player-error__fallback">
                      <p>Still failing? Download directly and upload below:</p>
                      <a href={currentGame.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
                        Download from Archive.org
                      </a>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="player-loading-container">
                  <Loader text={`Loading ${currentGame.title}...`} />
                  {currentGame.console === 'NDS' && (
                    <p className="player-loading-note">Large game detected. Initial download may take 2-3 minutes...</p>
                  )}
                </div>
              ) : (currentGame.requiresUpload && !romData) ? (
                <UploadRomArea onUpload={(buffer) => setRomData(buffer)} title={currentGame.title} />
              ) : (
                <>
                  {!isEngineReady && (
                    <div className="player-engine-loading">
                      <Loader text="Starting engine..." />
                    </div>
                  )}
                  <canvas 
                    ref={canvasRef} 
                    className={`player-canvas ${!isEngineReady ? 'player-canvas--loading' : ''}`}
                    id="canvas"
                  />
                </>
              )}
            </div>
          </div>

          {/* Neural Link - V3 Cinematic Bar */}
          {supportsSaves && (
            <div className="v3-operational-bar">
              <div className="v3-bar-group">
                <div className="v3-bar-pill">
                  <Clock size={14} className="v3-icon-violet" />
                  <span className="v3-bar-value">{formatTime(playtime)}</span>
                </div>
                <div className="v3-bar-pill">
                  {isAuthenticated ? <Cloud size={14} className="v3-icon-blue" /> : <CloudOff size={14} className="v3-icon-gray" />}
                  <span className="v3-bar-label">{isAuthenticated ? 'Cluster Sync' : 'Local Node'}</span>
                </div>
              </div>
              
              <button 
                className="v3-save-button" 
                onClick={() => { setSaveModalMode('new'); setSaveModalDefault(''); setSaveModalOpen(true); }}
                disabled={savingToCloud}
              >
                <Save size={16} />
                <span>{savingToCloud ? 'Saving...' : 'Save Game'}</span>
                <span className="v3-save-counter">{saveSlots.length}/{MAX_SAVE_SLOTS}</span>
              </button>
            </div>
          )}

          <div className="player-editorial-grid">
            {/* Chronicle Lore */}
            <div className="editorial-card editorial-card--lore">
              <div className="editorial-header">
                <div className="editorial-icon"><BookOpen size={16} /></div>
                <h3>Game Lore</h3>
              </div>
              <div className="lore-content">
                <p className="player-description">{details.description}</p>
                
                {details.features && details.features.length > 0 && (
                  <div className="player-features">
                    <h4 className="player-features__title">Key Highlights</h4>
                    <ul className="player-features__list">
                      {details.features.map((feature, i) => (
                        <li key={i} className="player-feature-item">
                          <Zap size={12} className="player-feature-icon" />
                          <span className="feature-text">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Operational DNA */}
            <div className="editorial-card editorial-card--dna">
              <div className="editorial-header">
                <div className="editorial-icon"><Zap size={16} /></div>
                <h3>Game Specifications</h3>
              </div>
              <div className="dna-grid">
                <div className="dna-item">
                  <span className="dna-label">Platform Architecture</span>
                  <span className="dna-value">{currentGame.console} Architecture</span>
                </div>
                <div className="dna-item">
                  <span className="dna-label">System Region</span>
                  <span className="dna-value">{details.region}</span>
                </div>
                <div className="dna-item">
                  <span className="dna-label">Deployment Era</span>
                  <span className="dna-value">{currentGame.year}</span>
                </div>
                <div className="dna-item">
                  <span className="dna-label">Operational Complexity</span>
                  <span className="dna-value">{details.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence Matrix - Final Integration */}
          <section className="intelligence-matrix">
            <div className="matrix-grid">
              <div className="matrix-item">
                <Gamepad2 size={20} className="matrix-icon" />
                <div className="matrix-info">
                  <h4>Control Interface</h4>
                  <p>Primary: Z / X • Movement: Arrows</p>
                </div>
              </div>
              <div className="matrix-item">
                <ShieldCheck size={20} className="matrix-icon" />
                <div className="matrix-info">
                  <h4>Integrity Status</h4>
                  <p>{isAuthenticated ? 'Cluster Verified' : 'Local Sandbox'}</p>
                </div>
              </div>
              <div className="matrix-item">
                <Trophy size={20} className="matrix-icon" />
                <div className="matrix-info">
                  <h4>Accumulated Time</h4>
                  <p>{details.playtime}</p>
                </div>
              </div>
            </div>
          </section>


          {/* Save Slots — only for games that support saves */}
          {supportsSaves && (
            <div className="player-editorial player-saves-section">
              <div className="editorial-card editorial-card--saves">
                <div className="editorial-header">
                  <div className="editorial-icon"><Save size={16} /></div>
                  <div className="editorial-header__flex">
                    <h3>Save Archive</h3>
                    <span className="player-saves-count">{saveSlots.length} / {MAX_SAVE_SLOTS}</span>
                  </div>
                  {saveMessage && (
                    <div className="save-status-toast">
                      <Zap size={12} className="animate-pulse" />
                      <span>{saveMessage}</span>
                    </div>
                  )}
                </div>

                {!isAuthenticated ? (
                  <div className="player-saves-empty">
                    <LogIn size={20} />
                    <p>Authentication required to sync chronologies across the cluster.</p>
                  </div>
                ) : saveSlots.length === 0 ? (
                  <div className="player-saves-empty">
                    <div className="empty-icon-circle">
                      <HardDrive size={20} />
                    </div>
                    <p>No save manifests detected. Begin your journey to initialize a new state.</p>
                  </div>
                ) : (
                  <div className="player-save-slots">
                  {saveSlots.map(save => (
                    <div key={save.id} className={`player-save-slot ${downloadingSave === save.id ? 'player-save-slot--syncing' : ''}`}>
                      <div className="player-save-info">
                        <div className="save-name-wrap">
                          <span className="player-save-name">{save.name || `Save Slot ${save.slot}`}</span>
                          <div className="save-badges">
                            {save.cloudUrl && !save.stateData && <Cloud size={10} title="Cloud only" />}
                            {save.stateData && <HardDrive size={10} title="Local storage" />}
                          </div>
                        </div>
                        <div className="save-meta">
                          <span className="save-date">{save.date}</span>
                          <span className="save-dot">•</span>
                          <span className="save-time">{save.playtime}</span>
                        </div>
                      </div>
                      <div className="player-save-actions">
                        <button
                          className="save-action-icon"
                          onClick={() => handleRenameSave(save.id)}
                          title="Rename"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="save-action-icon save-action-overwrite"
                          onClick={() => handleOverwriteSave(save.id)}
                          title="Overwrite with current progress"
                          disabled={savingToCloud}
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          className="save-action-primary"
                          onClick={() => handleLoadState(save)}
                          disabled={downloadingSave === save.id}
                        >
                          {downloadingSave === save.id ? (
                            <Loader variant="inline" text="" />
                          ) : (
                            <>
                              <FolderOpen size={14} />
                              <span>{save.stateData ? 'Resume' : 'Sync'}</span>
                            </>
                          )}
                        </button>
                        <button
                          className="save-action-danger"
                          onClick={() => handleDeleteSave(save.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {saveSlots.length >= MAX_SAVE_SLOTS && (
                <div className="player-saves-warning">
                  <AlertTriangle size={14} />
                  <span>Maximum saves reached. Delete a save to create a new one.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

        {/* Sidebar */}
        <aside className="player-sidebar">
          {/* Game Cover */}
          <div className="player-cover">
            <div className="player-cover__image">
              <img
                src={currentGame.thumbnail || '/thumbnails/default-cover.svg'}
                alt={currentGame.title}
                className="player-cover__img"
                onError={(e) => { e.target.src = '/thumbnails/default-cover.svg' }}
              />
            </div>
            <div className="player-cover__info">
              <div className="player-cover__row">
                <Calendar size={14} />
                <span>Release: {currentGame.year}</span>
              </div>
              <div className="player-cover__row">
                <MapPin size={14} />
                <span>Region: {details.region}</span>
              </div>
              <div className="player-cover__row">
                <Gamepad2 size={14} />
                <span>Platform: {currentGame.console}</span>
              </div>
            </div>
          </div>

          {/* Similar Games */}
          {similarGames.length > 0 && (
            <div className="player-similar">
              <h3 className="player-similar__title">Similar Games</h3>
              <div className="player-similar__list">
                {similarGames.map(g => (
                  <button
                    key={g.id}
                    className="player-similar__item"
                    onClick={() => onPlayGame && onPlayGame(g)}
                  >
                    <img
                      src={g.thumbnail || '/thumbnails/default-cover.svg'}
                      alt={g.title}
                      className="player-similar__thumb"
                      onError={(e) => { e.target.src = '/thumbnails/default-cover.svg' }}
                    />
                    <div className="player-similar__info">
                      <span className="player-similar__name">{g.title}</span>
                      <span className="player-similar__year">{g.year}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <button className="player-back-btn" onClick={() => navigate('library')}>
            ← Back to Games
          </button>
        </aside>
      </div>

      {/* Save Name Modal */}
      <SaveNameModal
        isOpen={saveModalOpen}
        defaultName={saveModalDefault}
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveModalOpen(false)}
      />

      {isMobile && (
        <div className="player-mobile-guard">
          <div className="mobile-guard__content">
            <div className="mobile-guard__visual">
              <Monitor size={64} className="icon--glow" />
              <div className="mobile-guard__scanner" />
            </div>
            <div className="mobile-guard__text">
              <h2>Desktop Core Required</h2>
              <p>The high-performance emulation engine requires a physical keyboard and desktop-class browser for safe execution.</p>
              <div className="mobile-guard__specs">
                <div className="spec-item">
                  <Cpu size={14} />
                  <span>WASM Performance</span>
                </div>
                <div className="spec-item">
                  <Gamepad2 size={14} />
                  <span>Input Mapping</span>
                </div>
              </div>
              <button className="mobile-guard__btn" onClick={() => navigate('library')}>
                Return to Library
              </button>
            </div>
          </div>
          <div className="mobile-guard__bg" />
        </div>
      )}
    </div>
  )
}

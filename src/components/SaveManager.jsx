import React, { useState } from 'react'
import { Download, Upload, HardDrive, Trash2, CheckCircle, AlertCircle, Cloud, CloudOff, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { syncToCloud, loadFromCloud, getAllGameSaves, deleteSaveState, saveGameState } from '../lib/cloudSaves'
import { games } from '../data/games'
import './SaveManager.css'

export default function SaveManager() {
    const [status, setStatus] = useState(null)
    const [message, setMessage] = useState('')
    const [syncing, setSyncing] = useState(false)
    const [cloudSaves, setCloudSaves] = useState([])
    const [loadingSaves, setLoadingSaves] = useState(false)
    const { user, isAuthenticated } = useAuth()

    React.useEffect(() => {
        if (isAuthenticated && user?.uid) {
            fetchCloudSaves()
        }
    }, [isAuthenticated, user?.uid])

    const fetchCloudSaves = async () => {
        setLoadingSaves(true)
        try {
            const data = await getAllGameSaves(user.uid)
            setCloudSaves(data || [])
        } catch (err) {
            console.error('Failed to fetch cloud saves:', err)
        } finally {
            setLoadingSaves(false)
        }
    }

    const showStatus = (type, msg) => {
        setStatus(type)
        setMessage(msg)
        setTimeout(() => {
            setStatus(null)
            setMessage('')
        }, 3000)
    }

    // Export all save data to JSON file
    const handleExport = () => {
        try {
            const saveData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
                lastPlayed: JSON.parse(localStorage.getItem('lastPlayed') || 'null'),
                playHistory: JSON.parse(localStorage.getItem('playHistory') || '[]'),
                settings: {
                    crt: localStorage.getItem('crt') === 'true',
                    scanlines: localStorage.getItem('scanlines') === 'true',
                    audio: localStorage.getItem('audio') !== 'false'
                }
            }

            const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `retrorift-save-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)

            showStatus('success', 'Save data exported successfully!')
        } catch (err) {
            showStatus('error', 'Failed to export save data')
        }
    }

    // Import save data from JSON file
    const handleImport = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result)

                if (data.favorites) localStorage.setItem('favorites', JSON.stringify(data.favorites))
                if (data.lastPlayed) localStorage.setItem('lastPlayed', JSON.stringify(data.lastPlayed))
                if (data.playHistory) localStorage.setItem('playHistory', JSON.stringify(data.playHistory))
                if (data.settings) {
                    localStorage.setItem('crt', data.settings.crt)
                    localStorage.setItem('scanlines', data.settings.scanlines)
                    localStorage.setItem('audio', data.settings.audio)
                }

                showStatus('success', 'Save data imported! Refresh to apply changes.')
            } catch (err) {
                showStatus('error', 'Invalid save file format')
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    // Cloud sync — push local to cloud
    const handleCloudSync = async () => {
        if (!isAuthenticated || !user?.uid) return
        setSyncing(true)
        try {
            await syncToCloud(user.uid)
            showStatus('success', 'Data synced to cloud! ☁️')
        } catch (err) {
            showStatus('error', 'Cloud sync failed: ' + err.message)
        } finally {
            setSyncing(false)
        }
    }

    // Cloud restore — pull cloud to local
    const handleCloudRestore = async () => {
        if (!isAuthenticated || !user?.uid) return
        setSyncing(true)
        try {
            const data = await loadFromCloud(user.uid)
            if (data) {
                showStatus('success', 'Data restored from cloud! Refresh to apply.')
            } else {
                showStatus('info', 'No cloud data found. Your local data was uploaded instead.')
            }
        } catch (err) {
            showStatus('error', 'Cloud restore failed: ' + err.message)
        } finally {
            setSyncing(false)
        }
    }

    // Calculate storage usage
    const getStorageSize = () => {
        let total = 0
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2
            }
        }
        return (total / 1024).toFixed(1)
    }

    return (
        <div className="save-manager neural-interface">
            <div className="save-manager__header">
                <div className="header-main">
                    <h3 className="save-manager__title">
                        <Cloud className="title-icon" size={20} />
                        Cloud Synchronizer
                    </h3>
                    <div className="neural-status">
                        <div className="status-dot pulsing" />
                        <span className="status-text">Neural Link Active</span>
                    </div>
                </div>
                <div className="storage-meter">
                    <div className="meter-label">Local Matrix Storage</div>
                    <div className="meter-track">
                        <div className="meter-fill" style={{ width: `${Math.min(100, (parseFloat(getStorageSize()) / 512) * 100)}%` }} />
                    </div>
                    <span className="save-manager__size">{getStorageSize()} KB</span>
                </div>
            </div>

            {status && (
                <div className={`save-manager__status save-manager__status--${status} animate-slide-in`}>
                    <div className="status-glow" />
                    {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="status-msg">{message}</span>
                    <button className="status-close" onClick={() => setStatus(null)}><Trash2 size={12} /></button>
                </div>
            )}

            <div className="save-manager__grid">
                {/* Cloud Control Hub */}
                <div className="save-card cloud-hub">
                    <div className="card-header">
                        <Zap size={14} />
                        <h4>Synaptic Link</h4>
                    </div>
                    
                    {isAuthenticated ? (
                        <div className="cloud-actions">
                            <button
                                className="sync-btn push"
                                onClick={handleCloudSync}
                                disabled={syncing}
                            >
                                <div className="btn-inner">
                                    <Upload size={18} />
                                    <div className="btn-text">
                                        <span className="primary">Push to Cloud</span>
                                        <span className="secondary">Upload local matrix</span>
                                    </div>
                                </div>
                                {syncing && <div className="sync-progress" />}
                            </button>

                            <button
                                className="sync-btn pull"
                                onClick={handleCloudRestore}
                                disabled={syncing}
                            >
                                <div className="btn-inner">
                                    <Download size={18} />
                                    <div className="btn-text">
                                        <span className="primary">Pull from Cloud</span>
                                        <span className="secondary">Restore remote state</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="auth-required">
                            <CloudOff size={32} />
                            <p>Authentication required for synaptic cloud linking.</p>
                            <button className="auth-btn">Establish Connection</button>
                        </div>
                    )}
                </div>

                {/* Local Matrix Hub */}
                <div className="save-card local-hub">
                    <div className="card-header">
                        <HardDrive size={14} />
                        <h4>Local Archive</h4>
                    </div>
                    <div className="local-actions">
                        <button className="action-tile" onClick={handleExport}>
                            <Download size={20} />
                            <span>Export Matrix</span>
                        </button>

                        <label className="action-tile">
                            <Upload size={20} />
                            <span>Import Matrix</span>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Cloud Game Saves Gallery */}
            {isAuthenticated && (
                <div className="save-manager__gallery">
                    <div className="save-manager__gallery-header">
                        <Cloud size={16} />
                        <h4>Global Cloud Chronology</h4>
                        <button className="gallery-refresh" onClick={fetchCloudSaves} disabled={loadingSaves}>
                           <Zap size={12} className={loadingSaves ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {loadingSaves ? (
                        <div className="gallery-loader">Scanning neural clusters...</div>
                    ) : cloudSaves.length === 0 ? (
                        <div className="gallery-empty">No synchronized game states found in the cloud cluster.</div>
                    ) : (
                        <div className="gallery-list">
                            {cloudSaves.map(gs => {
                                const game = games.find(g => String(g.id) === String(gs.gameId))
                                return (
                                    <div key={gs.gameId} className="gallery-item">
                                        <div className="gallery-item__game">
                                            <span className="gallery-game-title">{game?.title || 'Unknown Game'}</span>
                                            <span className="gallery-game-console">{game?.console || gs.gameId}</span>
                                        </div>
                                        <div className="gallery-item__slots">
                                            {gs.slots?.map(slot => (
                                                <div key={slot.id} className="gallery-slot">
                                                    <div className="gallery-slot-info">
                                                        <span className="gallery-slot-name">{slot.name}</span>
                                                        <span className="gallery-slot-date">{slot.date}</span>
                                                    </div>
                                                    <div className="gallery-slot-actions">
                                                        <button 
                                                            className="gallery-btn-delete"
                                                            onClick={async () => {
                                                                if (window.confirm('Erase this chronology from the cloud?')) {
                                                                    await deleteSaveState(user.uid, gs.gameId, slot.id)
                                                                    const remainingSlots = gs.slots.filter(s => s.id !== slot.id)
                                                                    await saveGameState(user.uid, gs.gameId, { slots: remainingSlots })
                                                                    fetchCloudSaves()
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            <p className="save-manager__hint">
                {isAuthenticated
                    ? 'Your game states and settings sync to the cloud automatically. Use Push/Pull for manual control.'
                    : 'Export your saves locally, or sign in for automatic cloud sync of game states.'
                }
            </p>
        </div>
    )
}

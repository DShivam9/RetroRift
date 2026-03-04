import React, { useState } from 'react'
import { Download, Upload, HardDrive, Trash2, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { syncToCloud, loadFromCloud } from '../lib/cloudSaves'
import './SaveManager.css'

export default function SaveManager() {
    const [status, setStatus] = useState(null)
    const [message, setMessage] = useState('')
    const [syncing, setSyncing] = useState(false)
    const { user, isAuthenticated } = useAuth()

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
        <div className="save-manager">
            <div className="save-manager__header">
                <h3 className="save-manager__title">
                    <HardDrive size={20} />
                    Save Data
                </h3>
                <span className="save-manager__size">{getStorageSize()} KB used</span>
            </div>

            {status && (
                <div className={`save-manager__status save-manager__status--${status}`}>
                    {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message}
                </div>
            )}

            {/* Cloud Sync Section */}
            {isAuthenticated && (
                <div className="save-manager__cloud">
                    <div className="save-manager__cloud-header">
                        <Cloud size={16} />
                        <span>Cloud Sync</span>
                        <span className="save-manager__cloud-badge">Connected</span>
                    </div>
                    <div className="save-manager__cloud-actions">
                        <button
                            className="save-manager__btn save-manager__btn--cloud"
                            onClick={handleCloudSync}
                            disabled={syncing}
                        >
                            <Upload size={16} />
                            <span>{syncing ? 'Syncing...' : 'Push to Cloud'}</span>
                        </button>
                        <button
                            className="save-manager__btn save-manager__btn--cloud"
                            onClick={handleCloudRestore}
                            disabled={syncing}
                        >
                            <Download size={16} />
                            <span>{syncing ? 'Restoring...' : 'Pull from Cloud'}</span>
                        </button>
                    </div>
                </div>
            )}

            {!isAuthenticated && (
                <div className="save-manager__cloud save-manager__cloud--offline">
                    <CloudOff size={16} />
                    <span>Sign in to enable cloud saves</span>
                </div>
            )}

            <div className="save-manager__actions">
                <button className="save-manager__btn" onClick={handleExport}>
                    <Download size={18} />
                    <span>Export Saves</span>
                </button>

                <label className="save-manager__btn">
                    <Upload size={18} />
                    <span>Import Saves</span>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            <p className="save-manager__hint">
                {isAuthenticated
                    ? 'Your saves sync to the cloud automatically. Use Push/Pull for manual control.'
                    : 'Export your saves locally, or sign in for automatic cloud sync.'
                }
            </p>
        </div>
    )
}

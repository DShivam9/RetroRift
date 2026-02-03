import React, { useState } from 'react'
import { Download, Upload, HardDrive, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import './SaveManager.css'

export default function SaveManager() {
    const [status, setStatus] = useState(null) // 'success' | 'error' | null
    const [message, setMessage] = useState('')

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
        e.target.value = '' // Reset input
    }

    // Calculate storage usage
    const getStorageSize = () => {
        let total = 0
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2 // UTF-16 characters = 2 bytes each
            }
        }
        return (total / 1024).toFixed(1) // KB
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
                Export your favorites, play history, and settings. Import on any device to continue where you left off.
            </p>
        </div>
    )
}

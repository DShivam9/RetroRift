import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Gamepad2, Clock } from 'lucide-react'
import { games } from '../data/games'
import './SearchModal.css'

export default function SearchModal({ isOpen, onClose, navigate, onPlayGame }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            setQuery('')
            setResults([])
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        const searchTerm = query.toLowerCase()
        const filtered = games.filter(game =>
            game.title.toLowerCase().includes(searchTerm) ||
            game.console.toLowerCase().includes(searchTerm)
        ).slice(0, 8)

        setResults(filtered)
        setSelectedIndex(0)
    }, [query])

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelectGame(results[selectedIndex])
        }
    }, [results, selectedIndex, onClose])

    const handleSelectGame = (game) => {
        onPlayGame(game)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="search-modal__backdrop" onClick={onClose}>
            <div className="search-modal" onClick={e => e.stopPropagation()}>
                <div className="search-modal__header">
                    <Search size={20} className="search-modal__icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-modal__input"
                        placeholder="Search games..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="search-modal__shortcut">ESC</div>
                    <button className="search-modal__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {results.length > 0 && (
                    <div className="search-modal__results">
                        {results.map((game, index) => (
                            <button
                                key={game.id}
                                className={`search-modal__result ${index === selectedIndex ? 'search-modal__result--active' : ''}`}
                                onClick={() => handleSelectGame(game)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="search-modal__result-icon">
                                    <Gamepad2 size={18} />
                                </div>
                                <div className="search-modal__result-info">
                                    <span className="search-modal__result-title">{game.title}</span>
                                    <span className="search-modal__result-meta">{game.console} • {game.year}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {query && results.length === 0 && (
                    <div className="search-modal__empty">
                        <p>No games found for "{query}"</p>
                    </div>
                )}

                {!query && (
                    <div className="search-modal__hint">
                        <Clock size={16} />
                        <span>Start typing to search games</span>
                    </div>
                )}
            </div>
        </div>
    )
}

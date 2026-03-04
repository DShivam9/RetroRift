import React, { useState, useEffect, useRef } from 'react'
import { X, Save } from 'lucide-react'
import { sanitizeSaveName } from '../lib/inputSanitizer'
import './SaveNameModal.css'

/**
 * SaveNameModal — Themed modal replacing window.prompt() for save naming
 */
export default function SaveNameModal({ isOpen, defaultName, onConfirm, onCancel }) {
    const [name, setName] = useState(defaultName || '')
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setName(defaultName || '')
            // Focus input after open animation
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, defaultName])

    const handleSubmit = (e) => {
        e?.preventDefault()
        const clean = sanitizeSaveName(name)
        onConfirm(clean)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel()
    }

    if (!isOpen) return null

    return (
        <div className="save-modal__backdrop" onClick={onCancel} onKeyDown={handleKeyDown}>
            <form
                className="save-modal"
                onClick={e => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="save-modal__header">
                    <Save size={18} />
                    <span>Name Your Save</span>
                    <button type="button" className="save-modal__close" onClick={onCancel}>
                        <X size={16} />
                    </button>
                </div>

                <input
                    ref={inputRef}
                    className="save-modal__input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value.slice(0, 50))}
                    placeholder="Enter save name..."
                    maxLength={50}
                    autoComplete="off"
                    spellCheck={false}
                />

                <div className="save-modal__hint">
                    {name.length}/50 characters
                </div>

                <div className="save-modal__actions">
                    <button type="button" className="save-modal__btn save-modal__btn--cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="save-modal__btn save-modal__btn--save">
                        <Save size={14} />
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}

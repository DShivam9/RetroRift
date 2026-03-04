import React, { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { checkUsername } from '../lib/profanityFilter'
import { Gamepad2, Sparkles } from 'lucide-react'
import './UsernameSetup.css'

/**
 * UsernameSetup — Shown once after first sign-up / sign-in.
 * User picks a custom username (not their Gmail name).
 * Includes profanity filter.
 */
export default function UsernameSetup({ uid, onComplete }) {
    const [username, setUsername] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Run through profanity filter + validation
        const check = checkUsername(username)
        if (!check.isClean) {
            setError(check.reason)
            return
        }

        const trimmed = username.trim()
        setSaving(true)
        setError('')

        try {
            const userRef = doc(db, 'users', uid)
            await setDoc(userRef, {
                displayName: trimmed,
                usernameSet: true,
                updatedAt: serverTimestamp()
            }, { merge: true })

            onComplete(trimmed)
        } catch (err) {
            setError('Failed to save username. Try again.')
            setSaving(false)
        }
    }

    return (
        <div className="username-setup">
            <div className="username-setup__overlay" />
            <div className="username-setup__card">
                <div className="username-setup__icon">
                    <Gamepad2 size={32} />
                </div>

                <h2 className="username-setup__title">Welcome, Player!</h2>
                <p className="username-setup__desc">
                    Choose a username for your RetroRift profile. This will be displayed across the site.
                </p>

                <form onSubmit={handleSubmit} className="username-setup__form">
                    <div className="username-setup__field">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setError('') }}
                            placeholder="Enter your username..."
                            className="username-setup__input"
                            maxLength={20}
                            autoFocus
                        />
                        <span className="username-setup__count">{username.length}/20</span>
                    </div>

                    {error && <div className="username-setup__error">{error}</div>}

                    <button
                        type="submit"
                        className="username-setup__submit"
                        disabled={saving || username.trim().length < 2}
                    >
                        <Sparkles size={18} />
                        <span>{saving ? 'Setting up...' : 'Start Playing'}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage({ navigate }) {
    const { signInWithGoogle, signIn, signUp, error, loading } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ email: '', password: '', displayName: '' })
    const [success, setSuccess] = useState('')

    const handleGoogleSignIn = async () => {
        try {
            setSubmitting(true)
            await signInWithGoogle()
            navigate('home')
        } catch (err) {
            // error is set by context
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setSuccess('')

        try {
            if (isSignUp) {
                await signUp(form.email, form.password, form.displayName || 'Player')
                setSuccess('Account created! Welcome aboard 🎮')
                setTimeout(() => navigate('home'), 1500)
            } else {
                await signIn(form.email, form.password)
                navigate('home')
            }
        } catch (err) {
            // error handled by context
        } finally {
            setSubmitting(false)
        }
    }

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="login">
            <div className="login__bg">
                <div className="login__grid" />
            </div>

            <div className="login__container">
                <button className="login__back" onClick={() => navigate('home')}>
                    <ArrowLeft size={18} />
                    <span>Back to Home</span>
                </button>

                <div className="login__card">
                    {/* Header */}
                    <div className="login__header">
                        <div className="login__logo">
                            <span className="login__logo-icon">🎮</span>
                            <h1 className="login__title">RetroPlay HUB</h1>
                        </div>
                        <p className="login__subtitle">
                            {isSignUp ? 'Create your account' : 'Welcome back, Player'}
                        </p>
                    </div>

                    {/* Google Sign-In */}
                    <button
                        className="login__google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={submitting}
                    >
                        <svg className="login__google-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>{submitting ? 'Signing in...' : 'Continue with Google'}</span>
                    </button>

                    {/* Divider */}
                    <div className="login__divider">
                        <span>or</span>
                    </div>

                    {/* Email Form */}
                    <form className="login__form" onSubmit={handleSubmit}>
                        {isSignUp && (
                            <div className="login__field">
                                <User size={18} className="login__field-icon" />
                                <input
                                    type="text"
                                    placeholder="Display Name"
                                    value={form.displayName}
                                    onChange={e => updateField('displayName', e.target.value)}
                                    className="login__input"
                                />
                            </div>
                        )}

                        <div className="login__field">
                            <Mail size={18} className="login__field-icon" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={e => updateField('email', e.target.value)}
                                className="login__input"
                                required
                            />
                        </div>

                        <div className="login__field">
                            <Lock size={18} className="login__field-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                onChange={e => updateField('password', e.target.value)}
                                className="login__input"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="login__eye"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && <div className="login__error">{error}</div>}
                        {success && <div className="login__success">{success}</div>}

                        <button
                            type="submit"
                            className="login__submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                                : (isSignUp ? 'Create Account' : 'Sign In')
                            }
                        </button>
                    </form>

                    {/* Toggle Sign In / Sign Up */}
                    <div className="login__toggle">
                        <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                        <button onClick={() => { setIsSignUp(!isSignUp); setSuccess('') }}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>

                    {/* Guest Mode */}
                    <button className="login__guest" onClick={() => navigate('home')}>
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    )
}

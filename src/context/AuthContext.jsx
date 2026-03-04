import React, { createContext, useContext, useState, useEffect } from 'react'
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [needsUsername, setNeedsUsername] = useState(false)

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid)
                const userSnap = await getDoc(userRef)

                if (!userSnap.exists()) {
                    // First time sign-in — create minimal doc
                    await setDoc(userRef, {
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL || null, // Use Gmail photo if available
                        joinDate: serverTimestamp(),
                        totalPlayTime: 0,
                        usernameSet: false
                    })
                    setNeedsUsername(true)
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: 'Player',
                        photoURL: firebaseUser.photoURL || null,
                        usernameSet: false
                    })
                } else {
                    const data = userSnap.data()
                    const hasUsername = data.usernameSet === true
                    setNeedsUsername(!hasUsername)
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: data.displayName || 'Player',
                        photoURL: data.photoURL || firebaseUser.photoURL || null,
                        usernameSet: hasUsername,
                        ...data
                    })
                }
            } else {
                setUser(null)
                setNeedsUsername(false)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Google sign-in
    const signInWithGoogle = async () => {
        try {
            setError(null)
            const result = await signInWithPopup(auth, googleProvider)
            return result.user
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    // Email/password sign-up
    const signUp = async (email, password, displayName) => {
        try {
            setError(null)
            const result = await createUserWithEmailAndPassword(auth, email, password)
            // Set display name
            await updateProfile(result.user, { displayName })
            return result.user
        } catch (err) {
            // Friendly error messages
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Try signing in instead.')
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.')
            } else {
                setError(err.message)
            }
            throw err
        }
    }

    // Email/password sign-in
    const signIn = async (email, password) => {
        try {
            setError(null)
            const result = await signInWithEmailAndPassword(auth, email, password)
            return result.user
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.')
            } else {
                setError(err.message)
            }
            throw err
        }
    }

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth)
            setUser(null)
        } catch (err) {
            setError(err.message)
        }
    }

    // Password reset
    const resetPassword = async (email) => {
        try {
            setError(null)
            await sendPasswordResetEmail(auth, email)
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    // Update username after setup
    const setUsername = (newName) => {
        setUser(prev => prev ? { ...prev, displayName: newName, usernameSet: true } : prev)
        setNeedsUsername(false)
    }

    // Update photoURL globally after upload
    const setPhotoURL = (url) => {
        setUser(prev => prev ? { ...prev, photoURL: url } : prev)
    }

    const value = {
        user,
        loading,
        error,
        needsUsername,
        setUsername,
        setPhotoURL,
        signInWithGoogle,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

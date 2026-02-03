import React from 'react'
import { Home, ArrowLeft, Gamepad2 } from 'lucide-react'
import './NotFoundPage.css'

export default function NotFoundPage({ navigate }) {
    return (
        <div className="not-found">
            <div className="not-found__content">
                <div className="not-found__glitch" data-text="404">404</div>
                <h1 className="not-found__title">Page Not Found</h1>
                <p className="not-found__text">
                    Looks like this level doesn't exist. The page you're looking for has been moved, deleted, or never existed.
                </p>
                <div className="not-found__actions">
                    <button className="btn btn--primary" onClick={() => navigate('home')}>
                        <Home size={18} />
                        Back to Home
                    </button>
                    <button className="btn btn--secondary" onClick={() => navigate('library')}>
                        <Gamepad2 size={18} />
                        Browse Games
                    </button>
                </div>
            </div>
        </div>
    )
}

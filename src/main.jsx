import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './styles/design-tokens.css'
import './styles/components.css'
import './styles/animations.css'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast'

import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <App />
        <Analytics />
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>,
)


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force reload for new dependencies
export default defineConfig({
  plugins: [
    react(),
  ],
})

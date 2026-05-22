import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { Readable } from 'stream'

// A small custom plugin to mimic the Vercel /api/proxy function during local Vite dev server
const localApiProxy = () => ({
  name: 'local-api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/proxy', async (req, res, next) => {
      try {
        const urlObj = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);
        const targetUrl = urlObj.searchParams.get('url');
        
        if (!targetUrl) {
          res.statusCode = 400;
          return res.end('Missing url parameter');
        }

        const fetchRes = await fetch(decodeURIComponent(targetUrl), { redirect: 'follow' });
        if (!fetchRes.ok) {
          res.statusCode = fetchRes.status;
          return res.end(`Origin error: ${fetchRes.statusText}`);
        }
        
        const contentType = fetchRes.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);
        const contentLength = fetchRes.headers.get('content-length');
        if (contentLength) res.setHeader('Content-Length', contentLength);
        
        if (fetchRes.body) {
           const reader = fetchRes.body.getReader();
           const nodeStream = new Readable({
             async read() {
               const { done, value } = await reader.read();
               if (done) this.push(null);
               else this.push(Buffer.from(value));
             }
           });
           nodeStream.pipe(res);
        } else {
           res.end();
        }
      } catch (err) {
        console.error('[Dev Proxy Error]', err.message);
        res.statusCode = 500;
        res.end(err.message);
      }
    });
  }
})

// https://vite.dev/config/
// Force reload for new dependencies
export default defineConfig({
  plugins: [
    react(),
    localApiProxy(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion', 'motion'],
          'vendor-three': ['three', '@react-three/fiber', 'postprocessing', '@react-three/postprocessing'],
          'vendor-utils': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
})

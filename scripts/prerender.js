import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'
import express from 'express'
import { games } from '../src/data/games.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'dist')

const getGameSlugs = () => {
  const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/pok-mon/g, 'pokemon').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return games.map(game => `/play/${normalize(game.title)}`)
}

const routes = ['/', '/library', '/favorites', '/login', '/profile', ...getGameSlugs()]

async function prerender() {
  console.log('🚀 Starting custom prerender for SEO...')
  
  const app = express()
  app.use(express.static(root))
  app.use((req, res) => res.sendFile(path.join(root, 'index.html')))
  
  const server = app.listen(3000)
  const browser = await puppeteer.launch({ headless: true })
  
  for (const route of routes) {
    const page = await browser.newPage()
    await page.goto(`http://localhost:3000${route}`)
    // Wait a bit to ensure React Helmet has injected the tags
    await new Promise(resolve => setTimeout(resolve, 2000)) 
    const html = await page.content()
    
    // Save the file
    // e.g. for /library, save to dist/library/index.html
    const dir = path.join(root, route === '/' ? '' : route)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    
    // For root, save as index.html
    const filePath = path.join(dir, 'index.html')
    fs.writeFileSync(filePath, html)
    console.log(`✅ Prerendered ${route} -> ${filePath.replace(root, 'dist')}`)
    
    await page.close()
  }
  
  await browser.close()
  server.close()
  console.log('🎉 Prerendering complete!')
}

prerender().catch(console.error)

#!/usr/bin/env node

/**
 * Auto-Importer for RetroPlay
 * 
 * Fetches files from a custom Internet Archive identifier, deduplicates them,
 * generates metadata, and downloads thumbnails from Libretro.
 * 
 * Usage: node scripts/auto-import.js <archive-identifier> [--rawg YOUR_API_KEY]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import stringSimilarity from 'string-similarity'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const METADATA_FILE = path.join(__dirname, 'game-metadata.json')
const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'thumbnails')

// Ensure thumbnails dir exists
if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true })
}

const args = process.argv.slice(2);
let identifier = null;
let rawgKey = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--rawg' && args[i+1]) {
        rawgKey = args[i+1];
        i++;
    } else if (!args[i].startsWith('-')) {
        identifier = args[i];
    }
}

// Extract identifier from URL if user pastes a full URL
if (identifier && identifier.includes('archive.org/download/')) {
    identifier = identifier.split('archive.org/download/')[1].split('/')[0]
} else if (identifier && identifier.includes('archive.org/details/')) {
    identifier = identifier.split('archive.org/details/')[1].split('/')[0]
}

if (!identifier) {
    console.error("❌ Usage: node scripts/auto-import.js <archive.org-identifier> [--rawg API_KEY]")
    console.error("   Example: node scripts/auto-import.js retroplay-ds-collection")
    process.exit(1)
}

// ─── Constants & Mappings ────────────────────────────────────────────────

const EXT_TO_CONSOLE = {
    '.gba': 'GBA', '.gb': 'GB', '.gbc': 'GBC', '.nes': 'NES',
    '.smc': 'SNES', '.sfc': 'SNES', '.nds': 'NDS', '.n64': 'N64',
    '.z64': 'N64', '.v64': 'N64', '.gen': 'Genesis', '.md': 'Genesis',
    '.zip': 'Unknown'
}

const LIBRETRO_SYSTEMS = {
    'GBA': 'Nintendo - Game Boy Advance',
    'GB': 'Nintendo - Game Boy',
    'GBC': 'Nintendo - Game Boy Color',
    'NES': 'Nintendo - Nintendo Entertainment System',
    'SNES': 'Nintendo - Super Nintendo Entertainment System',
    'NDS': 'Nintendo - Nintendo DS',
    'N64': 'Nintendo - Nintendo 64',
    'Genesis': 'Sega - Mega Drive - Genesis'
}

// Global cache for libretro indexes
const libretroIndexCache = {};

// ─── Helper Functions ───────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanTitle(filename) {
    let title = filename;
    
    // Remove leading numbers (e.g. "1190 - ")
    title = title.replace(/^\d+\s*-\s*/, '')
    
    // Remove tags
    title = title
        .replace(/\s*\((?:USA|U|Europe|E|Japan|J|World|W|Rev\s*\d*|V?\d+\.\d+|Beta|Proto|Unl|Pirate|PD|Hack|M\d+|S|C|En,Fr,Es,De,It,Nl,Sv,No,Da,Fi,Pt|Korea|China)\)/gi, '')
        .replace(/\s*\[(?:!|b\d*|a\d*|o\d*|p\d*|t\d*|f\d*|h\d*|T[+-]\w+)\]/gi, '')
        .replace(/\s*\(.*?\)/g, '')
        .replace(/\s*\[.*?\]/g, '')
        .trim()
        
    // Remove "The" from end
    if (title.includes(', The')) {
        title = 'The ' + title.replace(', The', '')
    }
    
    return title.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── Step 1: Fetch Archive.org ──────────────────────────────────────────

async function fetchArchiveFiles(id) {
    console.log(`\n🔍 Fetching files for Archive.org item: ${id}...`)
    try {
        const response = await fetch(`https://archive.org/metadata/${id}`)
        const data = await response.json()
        
        if (!data.files) {
            console.error("❌ No files found or item does not exist.")
            process.exit(1)
        }
        
        return data.files
    } catch (e) {
        console.error("❌ Failed to fetch Archive.org metadata:", e.message)
        process.exit(1)
    }
}

// ─── Step 2: Smart Deduplication ────────────────────────────────────────

function deduplicateFiles(files) {
    console.log(`\n🧹 Deduplicating ${files.length} files...`)
    
    const validExtensions = Object.keys(EXT_TO_CONSOLE)
    const filteredFiles = files.filter(f => {
        const ext = path.extname(f.name).toLowerCase()
        return validExtensions.includes(ext)
    })
    
    const groups = {}
    
    for (const f of filteredFiles) {
        // Skip obvious bad files
        const nameUpper = f.name.toUpperCase()
        if (nameUpper.includes('(BETA)') || nameUpper.includes('(DEMO)') || nameUpper.includes('(PROMO)') || nameUpper.includes('VIRTUAL CONSOLE')) {
            continue;
        }
        
        const ext = path.extname(f.name)
        const baseName = path.basename(f.name, ext)
        const cleanName = cleanTitle(baseName)
        
        // Group by clean title + extension (to not mix platforms if same name)
        const groupKey = `${cleanName}_${ext.toLowerCase()}`
        
        if (!groups[groupKey]) {
            groups[groupKey] = []
        }
        groups[groupKey].push(f)
    }
    
    const finalFiles = []
    
    for (const [key, group] of Object.entries(groups)) {
        if (group.length === 1) {
            finalFiles.push(group[0])
            continue
        }
        
        // If multiple, rank them
        // 1. USA
        // 2. World
        // 3. Europe
        // 4. Highest Rev
        // Avoid Japan if possible
        let bestFile = group[0]
        let bestScore = -1
        
        for (const f of group) {
            let score = 0
            const n = f.name.toUpperCase()
            
            if (n.includes('(USA)')) score += 100
            if (n.includes('(WORLD)')) score += 90
            if (n.includes('(EUROPE)')) score += 50
            if (n.includes('(JAPAN)')) score -= 50
            
            if (n.match(/REV\s*1/)) score += 10
            if (n.match(/REV\s*2/)) score += 20
            
            if (score > bestScore) {
                bestScore = score
                bestFile = f
            }
        }
        
        finalFiles.push(bestFile)
    }
    
    console.log(`   ✅ Kept ${finalFiles.length} unique games after deduplication.`)
    return finalFiles
}

// ─── Step 3: Fetch Libretro Thumbnails ──────────────────────────────────

async function getLibretroIndex(consoleName) {
    const sysName = LIBRETRO_SYSTEMS[consoleName]
    if (!sysName) return []
    
    if (libretroIndexCache[sysName]) {
        return libretroIndexCache[sysName]
    }
    
    console.log(`   🌐 Fetching Libretro Boxart Index for ${sysName}...`)
    try {
        const url = `https://thumbnails.libretro.com/${encodeURIComponent(sysName)}/Named_Boxarts/`
        const res = await fetch(url)
        const html = await res.text()
        
        // Extract all .png filenames
        const regex = /href="([^"]+\.png)"/g
        let match;
        const filenames = [];
        while ((match = regex.exec(html)) !== null) {
            filenames.push(decodeURIComponent(match[1]))
        }
        
        libretroIndexCache[sysName] = filenames
        return filenames
    } catch (e) {
        console.warn(`   ⚠️ Failed to fetch Libretro index for ${sysName}`)
        return []
    }
}

async function downloadThumbnail(cleanName, consoleName) {
    // Try the primary console first
    let result = await tryDownloadThumbnailForConsole(cleanName, consoleName);
    if (result) return result;
    
    // Fallback: search all other Nintendo consoles
    const fallbacks = ['GBA', 'NDS', 'GBC', 'GB', 'SNES', 'NES'];
    for (const fbConsole of fallbacks) {
        if (fbConsole === consoleName) continue;
        result = await tryDownloadThumbnailForConsole(cleanName, fbConsole);
        if (result) {
            return { path: result.path, correctConsole: fbConsole };
        }
    }
    
    return null;
}

async function tryDownloadThumbnailForConsole(cleanName, consoleName) {
    const index = await getLibretroIndex(consoleName)
    if (index.length === 0) return null
    
    const targetName = cleanName.toLowerCase()
    
    if (!libretroIndexCache[`${consoleName}_cleaned`]) {
        libretroIndexCache[`${consoleName}_cleaned`] = index.map(f => ({
            original: f,
            clean: cleanTitle(path.basename(f, '.png')).toLowerCase()
        }))
    }
    
    const mappedIndex = libretroIndexCache[`${consoleName}_cleaned`]
    
    let match = mappedIndex.find(f => f.clean === targetName)
    
    if (!match && mappedIndex.length > 0) {
        const cleanNames = mappedIndex.map(f => f.clean)
        const bestMatch = stringSimilarity.findBestMatch(targetName, cleanNames)
        
        if (bestMatch.bestMatch.rating > 0.8) {
            match = mappedIndex[bestMatch.bestMatchIndex]
        }
    }
    
    if (match) {
        const url = `https://thumbnails.libretro.com/${encodeURIComponent(LIBRETRO_SYSTEMS[consoleName])}/Named_Boxarts/${encodeURIComponent(match.original)}`
        const localPath = path.join(THUMBNAILS_DIR, `${cleanName}.png`)
        
        if (!fs.existsSync(localPath)) {
            try {
                const res = await fetch(url)
                if (res.ok) {
                    const buffer = await res.arrayBuffer()
                    fs.writeFileSync(localPath, Buffer.from(buffer))
                    return { path: `/thumbnails/${cleanName}.png` }
                }
            } catch (e) {
                // Silent fail
            }
        } else {
            return { path: `/thumbnails/${cleanName}.png` }
        }
    }
    
    return null
}

// ─── Step 4: Fetch RAWG Metadata (Optional) ─────────────────────────────

async function fetchRAWG(gameName, consoleName) {
    if (!rawgKey) return null;
    
    try {
        const url = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(gameName)}&page_size=1`
        const res = await fetch(url)
        const data = await res.json()
        
        if (data.results && data.results.length > 0) {
            const game = data.results[0]
            
            // Fetch detailed description
            const detailRes = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${rawgKey}`)
            const detailData = await detailRes.json()
            
            return {
                description: detailData.description_raw || "",
                genre: game.genres?.[0]?.name || "Action",
                year: game.released ? parseInt(game.released.split('-')[0]) : null,
                rating: game.rating > 0 ? game.rating : 3.5,
                developer: detailData.developers?.[0]?.name || "Unknown",
            }
        }
    } catch (e) {
        // Silent fail
    }
    
    return null;
}

// ─── Main Execution ─────────────────────────────────────────────────────

async function run() {
    const rawFiles = await fetchArchiveFiles(identifier)
    const games = deduplicateFiles(rawFiles)
    
    let metadata = {}
    if (fs.existsSync(METADATA_FILE)) {
        metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'))
    }
    
    console.log(`\n📥 Importing ${games.length} games...`)
    
    let addedCount = 0;
    
    for (let i = 0; i < games.length; i++) {
        const file = games[i]
        const ext = path.extname(file.name)
        const baseName = path.basename(file.name, ext)
        const cleanName = cleanTitle(baseName)
        const consoleName = EXT_TO_CONSOLE[ext.toLowerCase()] || 'Unknown'
        
        // Setup or update entry
        if (!metadata[cleanName]) {
            metadata[cleanName] = {
                console: consoleName,
                virtual: true
            }
        }
        
        // Ensure console is correct (don't overwrite with Unknown if it's already set)
        if (metadata[cleanName].console === 'Unknown' && consoleName !== 'Unknown') {
            metadata[cleanName].console = consoleName;
        }
        
        metadata[cleanName].externalUrl = `https://archive.org/download/${identifier}/${file.name}`;
        
        // Get Thumbnail
        const thumb = await downloadThumbnail(cleanName, metadata[cleanName].console);
        if (thumb) {
            process.stdout.write(`🖼️  `)
        } else {
            process.stdout.write(`   `)
        }
        
        // Get Metadata
        if (rawgKey) {
            const rawgMeta = await fetchRAWG(cleanName, consoleName)
            if (rawgMeta) {
                metadata[cleanName] = { ...metadata[cleanName], ...rawgMeta }
                process.stdout.write(`📝 `)
            }
            // Rate limiting respect
            await sleep(500)
        }
        
        console.log(`✅`)
        addedCount++;
        
        // Save periodically in case of crash
        if (i % 10 === 0) {
            fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 4))
        }
    }
    
    // Final save
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 4))
    
    console.log(`\n🎉 Import Complete!`)
    console.log(`   Added ${addedCount} new games to game-metadata.json`)
    console.log(`   Run 'npm run scan-roms' to update your site.`)
}

run()

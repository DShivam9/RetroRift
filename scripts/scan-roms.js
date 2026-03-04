#!/usr/bin/env node

/**
 * ROM Scanner — Auto-generates src/data/games.js from public/roms/ directory
 * 
 * Usage: node scripts/scan-roms.js
 * 
 * Folder structure expected:
 *   public/roms/gba/   → .gba files
 *   public/roms/nes/   → .nes files
 *   public/roms/snes/  → .smc, .sfc files
 *   public/roms/nds/   → .nds files
 *   public/roms/n64/   → .n64, .z64, .v64 files
 *   public/roms/gb/    → .gb files
 *   public/roms/gbc/   → .gbc files
 *   public/roms/segacd/ → .cue directories
 *   public/roms/genesis/ → .gen, .md files
 *   public/roms/sms/   → .sms files
 *   public/roms/gamegear/ → .gg files
 *   public/roms/pce/   → .pce files
 * 
 * Also supports flat structure (ROMs directly in public/roms/) — 
 * system is detected from file extension.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, '..')
const ROMS_DIR = path.join(ROOT, 'public', 'roms')
const THUMBNAILS_DIR = path.join(ROOT, 'public', 'thumbnails')
const OUTPUT_FILE = path.join(ROOT, 'src', 'data', 'games.js')
const METADATA_FILE = path.join(__dirname, 'game-metadata.json')

// ─── Extension → Console mapping ───────────────────────────────────────
const EXT_TO_CONSOLE = {
    '.gba': 'GBA',
    '.gb': 'GB',
    '.gbc': 'GBC',
    '.nes': 'NES',
    '.smc': 'SNES',
    '.sfc': 'SNES',
    '.nds': 'NDS',
    '.n64': 'N64',
    '.z64': 'N64',
    '.v64': 'N64',
    '.gen': 'Genesis',
    '.md': 'Genesis',
    '.sms': 'SMS',
    '.gg': 'GameGear',
    '.pce': 'PCE',
    '.cue': 'SegaCD',
    '.bin': 'SegaCD',
    '.32x': '32X',
    '.a26': 'Atari2600',
    '.a78': 'Atari7800',
    '.nge': 'NGPC',
    '.ngp': 'NGPC',
    '.ws': 'WonderSwan',
    '.wsc': 'WonderSwan',
    '.psx': 'PS1',
    '.iso': 'PS1',
}

// ─── Folder name → Console mapping ─────────────────────────────────────
const FOLDER_TO_CONSOLE = {
    'gba': 'GBA',
    'gb': 'GB',
    'gbc': 'GBC',
    'nes': 'NES',
    'snes': 'SNES',
    'nds': 'NDS',
    'n64': 'N64',
    'segacd': 'SegaCD',
    'genesis': 'Genesis',
    'sms': 'SMS',
    'gamegear': 'GameGear',
    'pce': 'PCE',
    '32x': '32X',
    'atari2600': 'Atari2600',
    'atari7800': 'Atari7800',
    'ngpc': 'NGPC',
    'wonderswan': 'WonderSwan',
    'ps1': 'PS1',
    'psx': 'PS1',
}

// ─── Console display names ─────────────────────────────────────────────
const CONSOLE_DISPLAY = {
    'GBA': 'Game Boy Advance',
    'GB': 'Game Boy',
    'GBC': 'Game Boy Color',
    'NES': 'Nintendo Entertainment System',
    'SNES': 'Super Nintendo',
    'NDS': 'Nintendo DS',
    'N64': 'Nintendo 64',
    'SegaCD': 'Sega CD',
    'Genesis': 'Sega Genesis',
    'SMS': 'Sega Master System',
    'GameGear': 'Sega Game Gear',
    'PCE': 'PC Engine',
    '32X': 'Sega 32X',
    'Atari2600': 'Atari 2600',
    'Atari7800': 'Atari 7800',
    'NGPC': 'Neo Geo Pocket Color',
    'WonderSwan': 'WonderSwan',
    'PS1': 'PlayStation',
}

// ─── ROM file extensions to scan for ───────────────────────────────────
const ROM_EXTENSIONS = new Set(Object.keys(EXT_TO_CONSOLE))

// ─── Helper: Clean game title from filename ────────────────────────────
function cleanTitle(filename) {
    let title = path.basename(filename, path.extname(filename))

    // Remove common ROM dump tags: (USA), [!], (U), (Europe), etc.
    title = title
        .replace(/\s*\((?:USA|U|Europe|E|Japan|J|World|W|Rev\s*\d*|V?\d+\.\d+|Beta|Proto|Unl|Pirate|PD|Hack)\)/gi, '')
        .replace(/\s*\[(?:!|b\d*|a\d*|o\d*|p\d*|t\d*|f\d*|h\d*|T[+-]\w+)\]/gi, '')
        .replace(/\s*\((?:M\d+|S|C)\)/gi, '')
        .trim()

    // Replace underscores with spaces
    title = title.replace(/_/g, ' ')

    // Clean up multiple spaces
    title = title.replace(/\s+/g, ' ').trim()

    return title
}

// ─── Helper: Normalize name for matching ───────────────────────────────
function normalizeForMatch(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

// ─── Helper: Find matching thumbnail ───────────────────────────────────
function findThumbnail(title) {
    if (!fs.existsSync(THUMBNAILS_DIR)) return null

    const normalizedTitle = normalizeForMatch(title)
    const files = fs.readdirSync(THUMBNAILS_DIR)

    // Try exact normalized match first
    for (const file of files) {
        const baseName = path.basename(file, path.extname(file))
        if (normalizeForMatch(baseName) === normalizedTitle) {
            return `/thumbnails/${file}`
        }
    }

    // Try partial match
    for (const file of files) {
        const baseName = path.basename(file, path.extname(file))
        const normalizedFile = normalizeForMatch(baseName)
        if (normalizedFile.includes(normalizedTitle) || normalizedTitle.includes(normalizedFile)) {
            return `/thumbnails/${file}`
        }
    }

    return null
}

// ─── Helper: Detect console from subfolder or extension ────────────────
function detectConsole(filePath, ext) {
    // Check if file is inside a known system subfolder
    const relativePath = path.relative(ROMS_DIR, filePath)
    const parts = relativePath.split(path.sep)

    if (parts.length > 1) {
        const folder = parts[0].toLowerCase()
        if (FOLDER_TO_CONSOLE[folder]) {
            return FOLDER_TO_CONSOLE[folder]
        }
    }

    // Fallback: detect from extension
    return EXT_TO_CONSOLE[ext] || 'Unknown'
}

// ─── Helper: Generate ROM path (web-safe URL) ──────────────────────────
function getRomPath(filePath) {
    const relative = path.relative(path.join(ROOT, 'public'), filePath)
    return '/' + relative.replace(/\\/g, '/')
}

// ─── Scan for .cue-based multi-file ROMs (SegaCD, PS1) ────────────────
function scanCueDirectories(dir, console_name) {
    const results = []

    if (!fs.existsSync(dir)) return results

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subDir = path.join(dir, entry.name)
            const subFiles = fs.readdirSync(subDir)
            const cueFile = subFiles.find(f => f.endsWith('.cue'))

            if (cueFile) {
                results.push({
                    filePath: path.join(subDir, cueFile),
                    title: cleanTitle(entry.name),
                    console: console_name,
                    romPath: getRomPath(path.join(subDir, cueFile)),
                })
            }
        }
    }

    return results
}

// ─── Main: Scan all ROMs ───────────────────────────────────────────────
function scanRoms() {
    const games = []

    if (!fs.existsSync(ROMS_DIR)) {
        console.log('⚠️  No roms directory found at', ROMS_DIR)
        console.log('   Creating directory structure...')
        for (const folder of Object.keys(FOLDER_TO_CONSOLE)) {
            fs.mkdirSync(path.join(ROMS_DIR, folder), { recursive: true })
        }
        console.log('   ✅ Created system subfolders in public/roms/')
        return games
    }

    // Recursive scan
    function scanDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                // Check for .cue-based ROMs in subdirectories
                const subFiles = fs.readdirSync(fullPath)
                const cueFile = subFiles.find(f => f.endsWith('.cue'))

                if (cueFile) {
                    // This is a multi-file ROM directory (SegaCD, PS1)
                    const cuePath = path.join(fullPath, cueFile)
                    const ext = '.cue'
                    const consoleName = detectConsole(cuePath, ext)

                    games.push({
                        title: cleanTitle(entry.name),
                        console: consoleName,
                        romPath: getRomPath(cuePath),
                        filePath: cuePath,
                    })
                } else {
                    // Regular directory, recurse into it
                    scanDir(fullPath)
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase()

                if (ROM_EXTENSIONS.has(ext)) {
                    // Skip .bin files that are part of .cue sets
                    if (ext === '.bin') {
                        const siblingFiles = fs.readdirSync(dir)
                        if (siblingFiles.some(f => f.endsWith('.cue'))) {
                            continue // Skip, this .bin is part of a .cue set
                        }
                    }

                    const consoleName = detectConsole(fullPath, ext)

                    games.push({
                        title: cleanTitle(entry.name),
                        console: consoleName,
                        romPath: getRomPath(fullPath),
                        filePath: fullPath,
                    })
                }
            }
        }
    }

    scanDir(ROMS_DIR)
    return games
}

// ─── Load metadata overrides ───────────────────────────────────────────
function loadMetadata() {
    if (!fs.existsSync(METADATA_FILE)) {
        console.log('📝 No game-metadata.json found, using auto-generated defaults')
        return {}
    }

    try {
        const raw = fs.readFileSync(METADATA_FILE, 'utf-8')
        return JSON.parse(raw)
    } catch (err) {
        console.error('⚠️  Error parsing game-metadata.json:', err.message)
        return {}
    }
}

// ─── Match metadata to game title ──────────────────────────────────────
function findMetadata(title, metadata) {
    // Direct match
    if (metadata[title]) return metadata[title]

    // Normalized match
    const normalizedTitle = normalizeForMatch(title)
    for (const [key, value] of Object.entries(metadata)) {
        if (normalizeForMatch(key) === normalizedTitle) {
            return value
        }
    }

    return null
}

// ─── Generate default description for unknown games ────────────────────
function generateDefaultDescription(title, consoleName) {
    const consoleDisplay = CONSOLE_DISPLAY[consoleName] || consoleName
    return `Play ${title} on the ${consoleDisplay}. Experience this classic retro game right in your browser.`
}

// ─── Generate the games.js output ──────────────────────────────────────
function generateOutput(scannedGames, metadata) {
    // Sort games: by console, then alphabetically by title
    scannedGames.sort((a, b) => {
        if (a.console !== b.console) return a.console.localeCompare(b.console)
        return a.title.localeCompare(b.title)
    })

    // Build game objects
    const gameEntries = scannedGames.map((game, index) => {
        const meta = findMetadata(game.title, metadata)
        const thumbnail = findThumbnail(game.title)

        const entry = {
            id: index + 1,
            title: game.title,
            console: game.console,
            year: meta?.year || null,
            thumbnail: thumbnail || '/thumbnails/default-cover.svg',
            romPath: game.romPath,
            genre: meta?.genre || 'Game',
            developer: meta?.developer || 'Unknown',
            description: meta?.description || generateDefaultDescription(game.title, game.console),
            difficulty: meta?.difficulty || 'Unknown',
            playtime: meta?.playtime || 'Varies',
            rating: meta?.rating || 3.5,
            features: meta?.features || [],
        }

        if (meta?.badge) {
            entry.badge = meta.badge
        }

        return entry
    })

    // Generate JS file content
    const gamesJSON = JSON.stringify(gameEntries, null, 2)

    const output = `/**
 * AUTO-GENERATED — Do not edit manually!
 * Generated by: node scripts/scan-roms.js
 * Generated at: ${new Date().toISOString()}
 * Total games: ${gameEntries.length}
 * 
 * To update: Add ROMs to public/roms/<system>/ and run "npm run scan-roms"
 */

export const games = ${gamesJSON}

// ─── Utility Functions ─────────────────────────────────────────────────

/** Get game by ID */
export function getGameById(id) {
  return games.find(g => g.id === id)
}

/** Get games by console */
export function getGamesByConsole(consoleName) {
  if (consoleName === 'ALL') return games
  return games.filter(g => g.console === consoleName)
}

/** Get featured games (for homepage) */
export function getFeaturedGames(limit = 8) {
  // Prioritize games with badges, then by rating
  const featured = [...games]
    .sort((a, b) => {
      const aScore = (a.badge === 'featured' ? 100 : a.badge === 'popular' ? 50 : 0) + (a.rating || 0) * 10
      const bScore = (b.badge === 'featured' ? 100 : b.badge === 'popular' ? 50 : 0) + (b.rating || 0) * 10
      return bScore - aScore
    })
  return featured.slice(0, limit)
}

/** Get unique consoles */
export function getConsoles() {
  return ['ALL', ...new Set(games.map(g => g.console))]
}

/** Get all games */
export function getAllGames() {
  return games
}

/** Search games by title */
export function searchGames(query) {
  const q = query.toLowerCase().trim()
  if (!q) return games
  return games.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.console.toLowerCase().includes(q) ||
    g.genre?.toLowerCase().includes(q) ||
    g.developer?.toLowerCase().includes(q)
  )
}

/** Get game count per console */
export function getConsoleCounts() {
  const counts = {}
  for (const game of games) {
    counts[game.console] = (counts[game.console] || 0) + 1
  }
  return counts
}

/** Get games by genre */
export function getGamesByGenre(genre) {
  return games.filter(g => g.genre?.toLowerCase() === genre.toLowerCase())
}

/** Get unique genres */
export function getGenres() {
  return [...new Set(games.map(g => g.genre).filter(Boolean))]
}

export default games
`

    return output
}

// ─── Create default thumbnail SVG ──────────────────────────────────────
function createDefaultThumbnail() {
    const svgPath = path.join(THUMBNAILS_DIR, 'default-cover.svg')

    if (fs.existsSync(svgPath)) return

    if (!fs.existsSync(THUMBNAILS_DIR)) {
        fs.mkdirSync(THUMBNAILS_DIR, { recursive: true })
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:0.6"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" rx="12" fill="url(#bg)"/>
  <rect x="20" y="20" width="260" height="360" rx="8" fill="none" stroke="url(#accent)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.4"/>
  <!-- Gamepad icon -->
  <g transform="translate(150,170)" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6">
    <rect x="-50" y="-25" width="100" height="60" rx="16"/>
    <circle cx="-22" cy="0" r="8"/>
    <circle cx="22" cy="-8" r="4" fill="#94a3b8"/>
    <circle cx="30" cy="0" r="4" fill="#94a3b8"/>
    <circle cx="22" cy="8" r="4" fill="#94a3b8"/>
    <circle cx="14" cy="0" r="4" fill="#94a3b8"/>
    <line x1="-22" y1="-8" x2="-22" y2="8"/>
    <line x1="-30" y1="0" x2="-14" y2="0"/>
  </g>
  <!-- Text -->
  <text x="150" y="240" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500">NO COVER ART</text>
  <text x="150" y="262" text-anchor="middle" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="11">Add thumbnail to /thumbnails/</text>
</svg>`

    fs.writeFileSync(svgPath, svg)
    console.log('🎨 Created default thumbnail: public/thumbnails/default-cover.svg')
}

// ─── Main execution ────────────────────────────────────────────────────
function main() {
    console.log('')
    console.log('🎮 ROM Scanner — RetroRift')
    console.log('─'.repeat(50))

    // Ensure directories exist
    createDefaultThumbnail()

    // Scan ROMs
    console.log(`📂 Scanning: ${ROMS_DIR}`)
    const scannedGames = scanRoms()

    if (scannedGames.length === 0) {
        console.log('⚠️  No ROM files found!')
        console.log('   Add ROM files to public/roms/<system>/ subfolders')
        console.log('   Supported extensions:', [...ROM_EXTENSIONS].join(', '))
    }

    // Load metadata
    const metadata = loadMetadata()
    const metadataCount = Object.keys(metadata).length
    console.log(`📝 Loaded ${metadataCount} metadata entries`)

    // Match stats
    let matched = 0
    let unmatched = 0
    for (const game of scannedGames) {
        if (findMetadata(game.title, metadata)) {
            matched++
        } else {
            unmatched++
            console.log(`   ⚠️  No metadata for: "${game.title}" (${game.console})`)
        }
    }

    // Generate output
    const output = generateOutput(scannedGames, metadata)
    fs.writeFileSync(OUTPUT_FILE, output, 'utf-8')

    // Summary
    console.log('')
    console.log('─'.repeat(50))
    console.log(`✅ Generated: src/data/games.js`)
    console.log(`   📊 Total games: ${scannedGames.length}`)
    console.log(`   ✅ With metadata: ${matched}`)
    if (unmatched > 0) {
        console.log(`   ⚠️  Without metadata: ${unmatched} (using defaults)`)
        console.log(`      Add entries to scripts/game-metadata.json for richer details`)
    }

    // Console breakdown
    const consoleCounts = {}
    for (const game of scannedGames) {
        consoleCounts[game.console] = (consoleCounts[game.console] || 0) + 1
    }
    if (Object.keys(consoleCounts).length > 0) {
        console.log('')
        console.log('   📋 Consoles:')
        for (const [console_name, count] of Object.entries(consoleCounts).sort((a, b) => b[1] - a[1])) {
            const displayName = CONSOLE_DISPLAY[console_name] || console_name
            console.log(`      ${console_name.padEnd(10)} ${String(count).padStart(4)} games  (${displayName})`)
        }
    }

    console.log('')
}

main()

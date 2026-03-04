#!/usr/bin/env node

/**
 * Bulk ROM Downloader — Download multiple ROM files at once
 * 
 * USAGE:
 * 
 *   Method 1 — From a text file of URLs:
 *     node scripts/download-roms.js --file urls.txt
 * 
 *   Method 2 — Pass URLs directly:
 *     node scripts/download-roms.js <url1> <url2> <url3> ...
 * 
 *   Method 3 — Interactive list (create scripts/rom-urls.txt):
 *     Add one URL per line, then run:
 *     node scripts/download-roms.js
 * 
 * OPTIONS:
 *   --file <path>     Read URLs from a text file (one URL per line)
 *   --system <name>   Override auto-detection (e.g., --system gba)
 *   --parallel <n>    Max concurrent downloads (default: 3)
 *   --name <name>     Override filename for single downloads
 * 
 * EXAMPLES:
 *   node scripts/download-roms.js https://example.com/rom1.gba https://example.com/rom2.nes
 *   node scripts/download-roms.js --file my-roms.txt --parallel 5
 *   node scripts/download-roms.js https://example.com/game.zip --system snes --name "Super Mario World"
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const ROMS_DIR = path.join(ROOT, 'public', 'roms')
const DEFAULT_URLS_FILE = path.join(__dirname, 'rom-urls.txt')

// ─── Extension → System folder mapping ─────────────────────────────────
const EXT_TO_SYSTEM = {
    '.gba': 'gba',
    '.gb': 'gb',
    '.gbc': 'gbc',
    '.nes': 'nes',
    '.smc': 'snes',
    '.sfc': 'snes',
    '.nds': 'nds',
    '.n64': 'n64',
    '.z64': 'n64',
    '.v64': 'n64',
    '.gen': 'genesis',
    '.md': 'genesis',
    '.sms': 'sms',
    '.gg': 'gamegear',
    '.pce': 'pce',
    '.cue': 'segacd',
    '.bin': 'segacd',
    '.32x': '32x',
    '.a26': 'atari2600',
    '.a78': 'atari7800',
    '.zip': null, // Will need system override
    '.7z': null,
}

// ─── Parse CLI arguments ────────────────────────────────────────────────
function parseArgs() {
    const args = process.argv.slice(2)
    const config = {
        urls: [],
        file: null,
        system: null,
        parallel: 3,
        name: null,
    }

    let i = 0
    while (i < args.length) {
        const arg = args[i]
        if (arg === '--file' || arg === '-f') {
            config.file = args[++i]
        } else if (arg === '--system' || arg === '-s') {
            config.system = args[++i]
        } else if (arg === '--parallel' || arg === '-p') {
            config.parallel = parseInt(args[++i]) || 3
        } else if (arg === '--name' || arg === '-n') {
            config.name = args[++i]
        } else if (arg === '--help' || arg === '-h') {
            console.log(fs.readFileSync(__filename, 'utf-8').match(/\/\*\*([\s\S]*?)\*\//)?.[1] || '')
            process.exit(0)
        } else if (arg.startsWith('http://') || arg.startsWith('https://')) {
            config.urls.push(arg)
        } else {
            console.error(`⚠️  Unknown argument: ${arg}`)
        }
        i++
    }

    return config
}

// ─── Read URLs from file ────────────────────────────────────────────────
function readUrlsFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`)
        return []
    }

    return fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && (line.startsWith('http://') || line.startsWith('https://')))
}

// ─── Derive filename from URL ───────────────────────────────────────────
function getFilenameFromUrl(url, customName) {
    const urlObj = new URL(url)
    let filename = decodeURIComponent(path.basename(urlObj.pathname))

    // Handle URLs that end in / or have no extension
    if (!filename || filename === '/') {
        filename = `rom_${Date.now()}`
    }

    // Apply custom name if provided (keep the extension)
    if (customName) {
        const ext = path.extname(filename)
        filename = customName + ext
    }

    return filename
}

// ─── Detect system from filename ────────────────────────────────────────
function detectSystem(filename, overrideSystem) {
    if (overrideSystem) return overrideSystem

    const ext = path.extname(filename).toLowerCase()
    const system = EXT_TO_SYSTEM[ext]

    if (!system) {
        console.warn(`   ⚠️  Can't auto-detect system for "${filename}" — using 'unknown/'`)
        return 'unknown'
    }

    return system
}

// ─── Download a single file ─────────────────────────────────────────────
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(destPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        const protocol = url.startsWith('https') ? https : http
        const file = fs.createWriteStream(destPath)

        const request = (targetUrl, redirectCount = 0) => {
            if (redirectCount > 5) {
                reject(new Error('Too many redirects'))
                return
            }

            protocol.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }, (response) => {
                // Handle redirects
                if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
                    const redirectUrl = response.headers.location
                    if (redirectUrl) {
                        const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, targetUrl).href
                        const redirectProtocol = fullUrl.startsWith('https') ? https : http

                        // Re-request with the right protocol
                        redirectProtocol.get(fullUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        }, (redirectResponse) => {
                            if ([301, 302, 303, 307, 308].includes(redirectResponse.statusCode)) {
                                request(redirectResponse.headers.location || fullUrl, redirectCount + 1)
                                return
                            }
                            if (redirectResponse.statusCode !== 200) {
                                reject(new Error(`HTTP ${redirectResponse.statusCode}`))
                                return
                            }
                            const totalBytes = parseInt(redirectResponse.headers['content-length'], 10)
                            let downloadedBytes = 0

                            redirectResponse.on('data', (chunk) => {
                                downloadedBytes += chunk.length
                                if (totalBytes) {
                                    const pct = Math.round((downloadedBytes / totalBytes) * 100)
                                    process.stdout.write(`\r   ⬇️  ${pct}% (${(downloadedBytes / 1024 / 1024).toFixed(1)} MB)`)
                                }
                            })

                            redirectResponse.pipe(file)
                            file.on('finish', () => {
                                file.close()
                                console.log(`\r   ✅ ${(downloadedBytes / 1024 / 1024).toFixed(1)} MB downloaded`)
                                resolve(destPath)
                            })
                        }).on('error', reject)
                        return
                    }
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`))
                    return
                }

                const totalBytes = parseInt(response.headers['content-length'], 10)
                let downloadedBytes = 0

                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length
                    if (totalBytes) {
                        const pct = Math.round((downloadedBytes / totalBytes) * 100)
                        process.stdout.write(`\r   ⬇️  ${pct}% (${(downloadedBytes / 1024 / 1024).toFixed(1)} MB)`)
                    }
                })

                response.pipe(file)
                file.on('finish', () => {
                    file.close()
                    console.log(`\r   ✅ ${(downloadedBytes / 1024 / 1024).toFixed(1)} MB downloaded`)
                    resolve(destPath)
                })
            }).on('error', (err) => {
                fs.unlink(destPath, () => { })
                reject(err)
            })
        }

        request(url)
    })
}

// ─── Process download queue with concurrency ────────────────────────────
async function processQueue(downloads, maxConcurrent) {
    const results = { success: 0, failed: 0, errors: [] }
    const queue = [...downloads]
    const active = new Set()

    async function processOne(item) {
        const { url, filename, system } = item
        const destPath = path.join(ROMS_DIR, system, filename)

        console.log(`\n📥 [${results.success + results.failed + 1}/${downloads.length}] ${filename}`)
        console.log(`   → ${system}/${filename}`)

        try {
            await downloadFile(url, destPath)
            results.success++
        } catch (err) {
            results.failed++
            results.errors.push({ filename, error: err.message })
            console.error(`   ❌ Failed: ${err.message}`)
        }
    }

    // Process with concurrency limit
    while (queue.length > 0 || active.size > 0) {
        while (queue.length > 0 && active.size < maxConcurrent) {
            const item = queue.shift()
            const promise = processOne(item).then(() => active.delete(promise))
            active.add(promise)
        }
        if (active.size > 0) {
            await Promise.race(active)
        }
    }

    return results
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
    console.log('')
    console.log('📦 Bulk ROM Downloader — RetroRift')
    console.log('─'.repeat(50))

    const config = parseArgs()

    // Gather URLs
    let urls = [...config.urls]

    if (config.file) {
        const fileUrls = readUrlsFromFile(config.file)
        urls.push(...fileUrls)
        console.log(`📄 Loaded ${fileUrls.length} URLs from: ${config.file}`)
    }

    // If no URLs from args or --file, check default file
    if (urls.length === 0 && fs.existsSync(DEFAULT_URLS_FILE)) {
        const defaultUrls = readUrlsFromFile(DEFAULT_URLS_FILE)
        if (defaultUrls.length > 0) {
            urls.push(...defaultUrls)
            console.log(`📄 Loaded ${defaultUrls.length} URLs from: scripts/rom-urls.txt`)
        }
    }

    if (urls.length === 0) {
        console.log('⚠️  No URLs provided!')
        console.log('')
        console.log('Usage:')
        console.log('  1. Create scripts/rom-urls.txt with one URL per line')
        console.log('  2. Or pass URLs directly: node scripts/download-roms.js <url1> <url2>')
        console.log('  3. Or use --file: node scripts/download-roms.js --file my-urls.txt')
        console.log('')
        console.log('Example rom-urls.txt:')
        console.log('  # GBA Games')
        console.log('  https://example.com/roms/SuperMarioAdvance.gba')
        console.log('  https://example.com/roms/ZeldaMinishCap.gba')
        console.log('  # NES Games')
        console.log('  https://example.com/roms/Contra.nes')
        process.exit(1)
    }

    // Build download list
    const downloads = urls.map(url => {
        const filename = getFilenameFromUrl(url, urls.length === 1 ? config.name : null)
        const system = detectSystem(filename, config.system)
        return { url, filename, system }
    })

    console.log(`\n🎮 Ready to download ${downloads.length} ROM(s)`)
    console.log(`   Concurrent downloads: ${config.parallel}`)

    // Show preview
    const systemCounts = {}
    for (const dl of downloads) {
        systemCounts[dl.system] = (systemCounts[dl.system] || 0) + 1
    }
    for (const [sys, count] of Object.entries(systemCounts)) {
        console.log(`   ${sys}: ${count} files`)
    }

    // Download
    const results = await processQueue(downloads, config.parallel)

    // Summary
    console.log('')
    console.log('─'.repeat(50))
    console.log(`✅ Downloaded: ${results.success}`)
    if (results.failed > 0) {
        console.log(`❌ Failed: ${results.failed}`)
        for (const err of results.errors) {
            console.log(`   - ${err.filename}: ${err.error}`)
        }
    }

    if (results.success > 0) {
        console.log('')
        console.log('🔄 Run "npm run scan-roms" to update the game catalog!')
    }

    console.log('')
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})

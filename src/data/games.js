/**
 * Centralized Game Catalog
 * Single source of truth for all games
 */

export const games = [
    {
        id: 1,
        title: 'Pokemon FireRed',
        console: 'GBA',
        year: 2004,
        thumbnail: '🔥',
        thumbnailImage: '/thumbnails/pokemon_firered.jpg',
        romPath: '/roms/pokemon_firered.gba',
        badge: 'popular'
    },
    {
        id: 2,
        title: 'Pokemon Ruby',
        console: 'GBA',
        year: 2002,
        thumbnail: '💎',
        thumbnailImage: '/thumbnails/pokemon_ruby.jpg',
        romPath: '/roms/pokemon_ruby.gba'
    },
    {
        id: 3,
        title: 'Pokemon Sapphire',
        console: 'GBA',
        year: 2002,
        thumbnail: '💧',
        thumbnailImage: '/thumbnails/pokemon_sapphire.jpg',
        romPath: '/roms/pokemon_sapphire.gba'
    },
    {
        id: 4,
        title: 'Pokemon Emerald',
        console: 'GBA',
        year: 2004,
        thumbnail: '💚',
        thumbnailImage: '/thumbnails/pokemon_emerald.jpg',
        romPath: '/roms/pokemon_emerald.gba',
        badge: 'featured'
    },
    {
        id: 5,
        title: 'Mario Kart: Super Circuit',
        console: 'GBA',
        year: 2001,
        thumbnail: '🏎️',
        thumbnailImage: '/thumbnails/mariokart_supercircuit.jpg',
        romPath: '/roms/mariokart_supercircuit.gba',
        badge: 'popular'
    },
    {
        id: 6,
        title: 'Pac-Man',
        console: 'NES',
        year: 1984,
        thumbnail: '🟡',
        thumbnailImage: '/thumbnails/pacman.jpeg',
        romPath: '/roms/pacman.nes'
    },
    {
        id: 7,
        title: 'Sonic 3D Blast',
        console: 'SegaCD',
        year: 1996,
        thumbnail: '🦔',
        thumbnailImage: '/thumbnails/sonic3dblast.jpg',
        romPath: '/roms/sonic3dblast/Sonic 3D Blast (USA).cue',
        badge: 'new'
    },
    {
        id: 8,
        title: 'Pokemon Platinum',
        console: 'NDS',
        year: 2008,
        thumbnail: '💿',
        thumbnailImage: '/thumbnails/pokemon_platinum.jpg',
        romPath: '/roms/pokemon_platinum.nds',
        badge: 'new'
    }
]

// Get game by ID
export function getGameById(id) {
    return games.find(g => g.id === id)
}

// Get games by console
export function getGamesByConsole(consoleName) {
    if (consoleName === 'ALL') return games
    return games.filter(g => g.console === consoleName)
}

// Get featured games (for homepage)
export function getFeaturedGames(limit = 8) {
    return games.slice(0, limit)
}

// Get unique consoles
export function getConsoles() {
    return ['ALL', ...new Set(games.map(g => g.console))]
}

// Get all games
export function getAllGames() {
    return games
}

export default games

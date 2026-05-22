const fs = require('fs');

let code = fs.readFileSync('scripts/scan-roms.js', 'utf8');

// 1. Add generateStableId function
const stableIdFn = `
// ─── Helper: Generate Stable ID ────────────────────
function generateStableId(title, consoleName) {
    let hash = 0;
    const str = (consoleName + '_' + title).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash) || 999999;
}

// ─── Generate the games.js output ──────────────────────────────────────`;

code = code.replace('// ─── Generate the games.js output ──────────────────────────────────────', stableIdFn);

// 2. Fix the entry object to use the stable ID
const entrySearch = `        const entry = {
            id: index + 1,`;
const entryReplace = `        const entry = {
            id: generateStableId(game.title, game.console),`;
code = code.replace(entrySearch, entryReplace);

// 3. Fix the thumbnail priority
const thumbSearch = `        const thumbnail = findThumbnail(game.title)`;
const thumbReplace = `        const thumbnail = findThumbnail(game.title) || meta?.boxArt`;
code = code.replace(thumbSearch, thumbReplace);

fs.writeFileSync('scripts/scan-roms.js', code);
console.log('Fixed scan-roms.js');

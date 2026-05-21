# RetroRift Future Roadmap — Development Backlog

This document outlines the detailed technical design, user experience requirements, and database schema mappings for the upcoming RetroPlayHUB features.

---

## 💾 Feature 1: Cloud Save Visual Enhancements & Metadata (Option 2)

### 1. Objective
Upgrade the current text-based Cloud Save slot list on the Player interface to a highly polished dashboard presenting cartridge aesthetics, console categories, relative save age, and byte size indicators.

### 2. User Interface Blueprint
* **Console Category Badges**: Display custom, themed badges (e.g., standard colors for `GBA` red, `NDS` blue, `GBC` green) next to save slots.
* **Physical Cartridge Indicator**: A subtle, stylized vector/icon cartridge preview that matches the console color scheme.
* **Relative Timestamps**: Instead of standard ISO date strings, use relative calculations (e.g., *"Saved 5 mins ago"*, *"Last synced yesterday"*).
* **Storage Footprint**: Print the size in Kilobytes (e.g., `128 KB`, `512 KB`) so users can audit their Firestore storage limits easily.

### 3. Implementation Blueprint
* **Data Fields**: Enrich `saveGameState` metadata calls inside [cloudSaves.js](file:///d:/RetroPlay/RetroPlayHUB/src/lib/cloudSaves.js) to store additional information:
  ```json
  {
    "slotId": "slot-1",
    "slotName": "Gym Leader Battle prep",
    "consoleType": "GBA",
    "timestamp": "firestore.FieldValue.serverTimestamp()",
    "byteSize": 131072,
    "playTimeSeconds": 3600
  }
  ```
* **UI Integration**: Create a custom `<CloudSaveCard />` component in the save manager panel utilizing smooth hover scaling and glassmorphism.

---

## 🏆 Feature 2: Deep Gamification - Trophies, XP Engine & Custom Rich Notifications

### 1. Objective
Transform the progress engine of RetroPlay Hub into an immersive gaming ecosystem, expanding from 12 flat achievements to **32 game-specific, genre-specific, and console-specific trophies**, building interactive filters, and rewarding unlocks with custom audio-synthesized retro chimes and glossy animated notifications.

### 2. Gamification Blueprint
* **Satisfying Level Progression**:
  Calculated in `xpEngine.js`: $\text{Level} = \lfloor\sqrt{\text{XP} / 25}\rfloor + 1$. Each game played, favorite added, streak maintained, and trophy unlocked triggers custom XP rewards.
* **Rarity Tier Aesthetics**:
  * **Bronze:** Dark slate panels, standard typography.
  * **Silver:** Chrome glass borders, diagonal white scan-line sweeps.
  * **Gold:** Metallic gold borders, warm golden pulse glows, and radial glare animations.
  * **Diamond/Platinum:** Custom wireframe borders, rotating cyber cyan/magenta neon sweeps, and floating starry dust sparkles.
* **Visually Rich Toast Notifications**:
  A custom arpeggiator generates an ascending 4-note retro arpeggio (C5 -> E5 -> G5 -> C6) using `AudioContext` sine-wave oscillators when a trophy is unlocked, launching a glossy glassmorphism card on screen featuring the trophy icon, tier, and a floating **"+XP Golden Pill"**.
* **Decoupled Event Architecture**:
  The progress engine triggers a window `CustomEvent` (`'retroPlayAchievementUnlocked'`), enabling clean global interception in `App.jsx` and triggering rich toasts from any file.

### 3. Implementation Blueprint
* **xpEngine.js**: Add 20 new achievements (making 32 total) with complex checking algorithms against played game IDs, platforms, and categories.
* **ProfilePage.jsx**: Add tab pills to filter achievements by category: `All`, `Progression`, `Console Master`, `Genre Specialist`, `Secrets & Specials`, and custom unlocked toggles.
* **Toast.jsx / Toast.css**: Support rich message objects and custom CSS layout overlays (`.toast--rich`) with animated linear sweeps.

---

## 🔌 Feature 3: Tactile Cartridge Insertion Loading Screen

### 1. Objective
Eliminate generic loading spinners when transitioning from the game library to the player page. Instead, build a highly immersive, interactive loading transition where a virtual game cartridge is physically pushed/inserted into the console slot, booting the system once assets are cached.

### 2. Interactive & Animation Narrative
* **Phase 1: The Floating Cartridge**: Clicking a game slides a highly polished physical cartridge into the viewport center. The cartridge color theme and label dynamically reflect the selected title (e.g., standard red shell for *Pokémon FireRed*, translucent gray for others).
* **Phase 2: Tactile Insertion Action**:
  * *Option A (Automated)*: Cartridge slides vertically downward into a high-contrast console slot with rubber-band spring dampening physics.
  * *Option B (Interactive Drag)*: Let the user drag-and-drop or physically push the cartridge downward into the console slot!
* **Phase 3: The Mechanical Snap & Boot**:
  * Once the cartridge matches the slot boundaries, play a satisfying mechanical "clack" click sound.
  * A virtual power LED glows bright green, a retro CRT flash effect pans across the screen, and the emulator instantly fades in, mounting the ready-to-play PlayerPage.

### 3. Technical Implementation
* **Pre-Caching Parallelism**: The loading screen sits directly on top of the DOM while the application initializes the heavy assets in the background:
  1. `gba-emulator.js` mounts the virtual WASM scripts.
  2. The ROM file is extracted from the local Cache/IndexedDB.
  3. The User's custom Cloud Saves metadata are fetched.
* **Seamless Page Transition**: As soon as all promises resolve, the tactile snap is triggered, ensuring the user gets zero lag once the gameplay layout mounts.

---

## 🔍 Feature 4: Advanced Game Library Filtering

### 1. Objective
Add a filter system for the game library based on **genres** and **release years**, making it easier for users to find specific titles as the library expands.

### 2. User Interface Blueprint
* **Filter Sidebar/Dropdown**: Implement a sleek filter menu within the game library UI.
* **Genre Tags**: Visual tags or checkboxes for different game genres (e.g., RPG, Platformer, Action).
* **Release Year Slider/Dropdown**: Allow users to filter games by specific release years or eras.

### 3. Implementation Blueprint
* **Data Fields**: Ensure game metadata includes `genre` and `releaseYear` attributes.
* **UI Integration**: Build filter components and integrate them with the existing game grid/list view, updating the displayed games dynamically based on selected filters.

---

## 🗄️ Feature 5: Automated Metadata Scraping API Integration

### 1. Objective
Automate the retrieval of game details and metadata (covers, descriptions, release years) from a solid API for retro console libraries to minimize manual data entry.

### 2. User Interface Blueprint
* **Auto-Fetch Button**: A button in the admin/upload panel to automatically fetch metadata using the game title or ROM hash.

### 3. Implementation Blueprint
* **API Integration**: Connect to an external API (like IGDB, ScreenScraper, or TheGamesDB) to pull metadata automatically.

---

## ❤️ Feature 6: Custom User Lists & Favorites

### 1. Objective
Allow users to save their favorite games and create custom curated lists to increase engagement and personalization.

### 2. User Interface Blueprint
* **Favorite Toggle**: A heart or star icon on game cards and details pages to add a game to favorites.
* **Custom Lists Dashboard**: A user profile section where users can create, edit, and manage custom collections.

### 3. Implementation Blueprint
* **Data Fields**: Add `favorites` and `customLists` arrays to the user profile schema in the database.
* **UI Integration**: Build a "My Collections" tab on the user dashboard.

---

## ⚡ Feature 7: High-Performance Search & Filtering Optimization

### 1. Objective
Ensure the search and filtering mechanics remain blazing fast even with massive collections of ROMs to prevent lag and maintain a seamless experience.

### 2. Implementation Blueprint
* **Indexing**: Implement robust indexing on the database for searchable fields (title, genre, console).
* **Client-Side Caching**: Utilize caching strategies (e.g., React Query, IndexedDB) for frequently accessed metadata.
* **Debouncing & Pagination**: Apply debouncing on search inputs and virtualized lists/pagination for rendering large grids.

---

## 🕹️ Feature 8: Enhanced Game Card Aesthetics & Console Era Sorting

### 1. Objective
Enhance the visual interactivity of game cards and improve homepage navigation by adding console era sorting.

### 2. User Interface Blueprint
* **Arcade Vibe Hover States**: Add subtle hover states or neon borders to individual game cards to mimic a classic arcade machine cabinet vibe.
* **Era Sorting Toggle**: Add a sorting mechanic by console era (e.g., "8-bit", "16-bit", "32-bit") directly on the homepage hero section.

### 3. Implementation Blueprint
* **CSS Animations**: Implement neon glow `box-shadow` and scale transforms on game card hover using CSS/Tailwind.
* **Metadata Update**: Add `consoleEra` tags to games. Update the homepage hero section to include quick-filter buttons for these eras.

---

## 🎮 Feature 9: Gamepad API & Controller Support

### 1. Objective
Add native controller support using the web Gamepad API, allowing users to plug in their controllers (like 8BitDo or Xbox controllers) and map inputs to the emulator seamlessly.

### 2. User Interface Blueprint
* **Controller Mapping Menu**: A dedicated settings panel to map physical buttons to emulator inputs.
* **Connection Toast**: An instant notification when a controller is successfully connected or disconnected.

### 3. Implementation Blueprint
* **Gamepad API Integration**: Hook into the browser's `navigator.getGamepads()` API to continuously poll inputs and feed them to the active emulator core.

---

## 🤝 Feature 10: Shareable Save States

### 1. Objective
Enable users to share their specific save states via unique links so friends can import them to try and beat high scores or take over from a tough boss fight.

### 2. User Interface Blueprint
* **Share Action**: A "Share" button next to each Cloud Save slot that copies a unique link to the clipboard.
* **Save Import Page**: A dedicated page for imported links that lets a user save the shared state directly into their own library and launch the game.

### 3. Implementation Blueprint
* **Firestore Sharing Rules**: Generate unique share tokens/IDs in Firestore linked to the specific `saveGameState` payloads.
* **Deep Linking**: Create a URL route (e.g., `/share/[saveId]`) that parses the shared token, retrieves the payload securely, and imports the data to the recipient's cache.

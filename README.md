# 🎮 RetroRift 

**A modern web-based retro gaming platform** that revives the classics — right in your browser.  
Built with **React**, **Vite**, and powered by **RetroArch WebAssembly Cores** for seamless, high-performance emulation.

---

## 🌟 Key Features  

- 🎮 **Multi-System Support** – Play titles from GBA, NES, SNES, N64, PlayStation, and more using RetroArch cores.
- 💾 **Cloud Save States** – Save and resume your progress anywhere. Firebase integration keeps your session alive.
- 🕹️ **Gamepad Compatibility** – Enjoy full controller support for an authentic emulation experience.
- ✨ **Dynamic Modern UI** – Highly aesthetic frontend with custom themes (CRT, Flat, Pixel), pixel-perfect glow animations, and glassmorphism elements built with vanilla CSS.
- 🗂️ **Game Library** – Browse and organize your favorite titles with high-quality thumbnails and rich metadata.
- 👤 **Player Profiles & Progression** – Track achievements, earn XP, and view your most recent sessions. 
- ⚡ **Lightning Fast** – Designed efficiently using `requestAnimationFrame`, CSS 3D transforms, and optimized bundle sizes.

---

## 🚀 Live Demo  

🔗 [**Play Now on RetroRift**](https://retroplayhub.netlify.app/)  

---

## 🧩 Tech Stack  

- **Frontend Framework:** React 18, Vite
- **Styling:** Vanilla CSS (Advanced CSS animations, custom design tokens, responsive layouts)
- **Emulation Engine:** RetroArch Cores (WASM), HTML5 Canvas
- **Backend & Database:** Firebase Auth, Firebase Firestore Storage
- **Routing & State:** React Context API, Hash-based declarative routing

---

## 🛠️ Local Development Setup

To run RetroPlay Hub locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/retroplay-hub.git
   cd retroplay-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   RetroPlay Hub uses Firebase for user authentication and cloud saves. You must provide your own Firebase configuration keys.
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎮 Supported File Formats  

| Console | Supported Extensions |
|----------|----------------------|
| **Game Boy Advance (GBA)** | `.gba` |
| **Nintendo Entertainment System (NES)** | `.nes` |
| **Super Nintendo (SNES)** | `.snes`, `.smc` |
| **Nintendo 64 (N64)** | `.n64`, `.z64` |
| **PlayStation (PS1)** | `.bin/.cue`, `.iso` |
| **Nintendo DS (NDS)** | `.nds` |

*Note: ROM files are not included in this repository. You must provide your own legally acquired game backups.*

---

## Contributing 🤝

Contributions are welcome! Please make sure to test your code locally before submitting a pull request.
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## License 📄

This project is intended for educational purposes. Please respect all applicable laws and copyrights regarding game files.

## Acknowledgments 🙏

- RetroArch team for the phenomenal WebAssembly emulation cores
- React, Vite, and the open-source community
- All contributors shaping the future of browser-based emulation!

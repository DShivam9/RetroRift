// GBA Emulator using EmulatorJS (local)
class GBAEmulator {
  constructor(canvas, system = 'gba', gameId = 'default') {
    this.canvas = canvas;
    this.system = system;
    this.gameId = gameId;
    this.container = canvas.parentElement;
    this.emulatorDiv = null;
    this.emulatorInstance = null;
    this.blobUrl = null;
  }

  // ROM Cache Helper using IndexedDB
  async _getCache(key) {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('RetroPlayCache', 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('roms')) {
            db.createObjectStore('roms');
          }
        };
        request.onsuccess = (e) => {
          const db = e.target.result;
          const transaction = db.transaction('roms', 'readonly');
          const store = transaction.objectStore('roms');
          const getReq = store.get(key);
          getReq.onsuccess = () => resolve(getReq.result);
          getReq.onerror = () => resolve(null);
        };
        request.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  async _setCache(key, data) {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('RetroPlayCache', 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('roms')) {
            db.createObjectStore('roms');
          }
        };
        request.onsuccess = (e) => {
          const db = e.target.result;
          const transaction = db.transaction('roms', 'readwrite');
          const store = transaction.objectStore('roms');
          store.put(data, key);
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => resolve(false);
        };
        request.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  // Ensure EmulatorJS assets (CSS + JS) are loaded exactly once
  async ensureAssets() {
    if (typeof window.EmulatorJS !== 'undefined') return true;
    if (window.__emulatorjsLoading) {
      // Another instance is loading; wait for it
      await window.__emulatorjsLoading;
      return typeof window.EmulatorJS !== 'undefined';
    }

    window.__emulatorjsLoading = new Promise((resolve, reject) => {
      try {
        const head = document.head;

        // Load CSS from CDN for better reliability
        if (!document.querySelector('link[data-emulatorjs]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdn.emulatorjs.org/stable/data/emulator.min.css';
          cssLink.setAttribute('data-emulatorjs', '');
          console.log('Loading EmulatorJS CSS from CDN:', cssLink.href);
          head.appendChild(cssLink);
        }

        // Load script from CDN for better reliability
        const script = document.createElement('script');
        script.src = 'https://cdn.emulatorjs.org/stable/data/emulator.min.js';
        console.log('Loading EmulatorJS script from CDN:', script.src);
        script.async = true;
        script.setAttribute('data-emulatorjs', '');
        script.onload = () => {
          console.log('EmulatorJS script loaded');
          resolve(true);
        };
        script.onerror = (e) => {
          console.error('Failed to load EmulatorJS', e);
          reject(new Error('EmulatorJS load failed'));
        };
        head.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });

    try {
      await window.__emulatorjsLoading;
      return typeof window.EmulatorJS !== 'undefined';
    } catch {
      return false;
    } finally {
      // Allow future retries if failed
      if (typeof window.EmulatorJS === 'undefined') {
        window.__emulatorjsLoading = null;
      }
    }
  }

  async loadROM(arrayBuffer, onStart = null) {
    console.log('ROM received:', arrayBuffer.byteLength, 'bytes');

    const assetsReady = await this.ensureAssets();
    if (!assetsReady) {
      console.error('EmulatorJS assets not available after load attempt');
      return false;
    }

    try {
      // Load fflate from CDN
      if (typeof window.fflate === 'undefined') {
        console.log('[Emulator] Loading fflate...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/fflate';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      let romData = new Uint8Array(arrayBuffer);
      const receivedSize = romData.byteLength;
      
      // Manual Unzip to bypass "Decompress Game Data" hang
      if (romData[0] === 0x50 && romData[1] === 0x4B && romData[2] === 0x03 && romData[3] === 0x04) {
        console.log(`[Emulator] ZIP detected (${receivedSize} bytes), decompressing manually...`);
        try {
          // Use async unzip for large files to avoid blocking the UI thread
          const decompressed = await new Promise((resolve, reject) => {
            window.fflate.unzip(romData, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });

          const fileName = Object.keys(decompressed).find(name => 
            name.toLowerCase().endsWith('.gba') || 
            name.toLowerCase().endsWith('.nds') || 
            name.toLowerCase().endsWith('.bin') ||
            name.toLowerCase().endsWith('.gb') ||
            name.toLowerCase().endsWith('.gbc') ||
            name.toLowerCase().endsWith('.nes') ||
            name.toLowerCase().endsWith('.smc') ||
            name.toLowerCase().endsWith('.sfc') ||
            name.toLowerCase().endsWith('.z64')
          );
          
          if (fileName) {
            console.log(`[Emulator] ✅ Extracted: ${fileName} (${decompressed[fileName].byteLength} bytes)`);
            romData = decompressed[fileName];
          } else {
            const errorMsg = `[Emulator] No compatible game file found in ZIP. Files: ${Object.keys(decompressed).join(', ')}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
          }
        } catch (unzipErr) {
          console.error('[Emulator] ❌ ZIP Decompression failed:', unzipErr);
          const detail = receivedSize < 5000000 ? "File is likely truncated (too small)." : "Internal ZIP structure error.";
          throw new Error(`Failed to extract game from ZIP: ${detail} (Error: ${unzipErr.message})`);
        }
      } else {
        console.log('[Emulator] Raw ROM detected (not a ZIP), proceeding...');
      }

      // Final sanity check
      if (romData.byteLength < 1000) {
        throw new Error('Game data is too small to be a valid ROM');
      }

      this.canvas.style.display = 'none';
      if (this.emulatorDiv) this.emulatorDiv.remove();
      this.emulatorDiv = document.createElement('div');
      this.emulatorDiv.id = 'game';
      this.emulatorDiv.style.width = '100%';
      this.emulatorDiv.style.height = '100%';
      this.container.appendChild(this.emulatorDiv);

      // Use the original arrayBuffer directly to avoid extraction conflicts
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      this.blobUrl = URL.createObjectURL(blob);

      const dataPath = 'https://cdn.emulatorjs.org/stable/data/';
      
      // Set globals FIRST
      window.EJS_gameUrl = this.blobUrl;
      window.EJS_core = this.system.toLowerCase(); 
      window.EJS_dataPath = dataPath;
      window.EJS_gameID = this.gameId; 
      window.EJS_startOnLoad = true;
      
      console.log(`[Emulator] Handing over to engine: core=${window.EJS_core}`);
      
      // Global hook for game start
      window.EJS_onGameStart = () => {
        console.log('[Emulator] 🚀 Engine started!');
        if (onStart) onStart();
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));

      this.emulatorInstance = new window.EmulatorJS('#game', {
        system: this.system,
        gameUrl: this.blobUrl,
        dataPath: dataPath,
        gameId: this.gameId,
        startOnLoad: true,
        onGameStart: () => {
          console.log('[Emulator] 🚀 Engine started (Instance Callback)!');
          if (onStart) onStart();
        }
      });

      // PROACTIVE START: Don't just wait for callbacks, consider it 'started' once initialized
      // This solves the 'Starting engine...' hang on some browsers
      setTimeout(() => {
        console.log('[Emulator] ⚡ Forcing ready state...');
        if (onStart) onStart();
      }, 1500);

      // ROBUST FALLBACK: Detect engine presence via DOM/Global state
      let pollCount = 0;
      const startPoll = setInterval(() => {
        pollCount++;
        
        // Look for the iframe and canvas created by EmulatorJS
        const iframe = this.emulatorDiv?.querySelector('iframe');
        const internalCanvas = this.emulatorDiv?.querySelector('canvas') || 
                               iframe?.contentDocument?.querySelector('canvas');
        
        // Check for indicators that the engine is running
        const isReady = !!(window.EJS_emulator || window.EJS_player || internalCanvas);
        
        if (isReady || pollCount > 40) { 
          clearInterval(startPoll);
          if (isReady) {
            console.log('[Emulator] 🛡️ Engine detected via polling!');
            if (onStart) onStart();
          }
        }
      }, 500);

      return true;
    } catch (error) {
      console.error('EmulatorJS initialization error:', error);
      return false;
    }
  }

  start() {
    // console.log('Emulator start');
  }

  pause() {
    console.log('Pausing emulator')
    if (this.emulatorInstance) {
      try {
        if (this.emulatorInstance.pause) {
          this.emulatorInstance.pause()
        }
        // Try alternative pause methods
        if (this.emulatorInstance.pauseGame) {
          this.emulatorInstance.pauseGame()
        }
      } catch (error) {
        console.error('Error pausing:', error)
      }
    }
  }

  reset() {
    if (this.emulatorInstance && this.emulatorInstance.reset) {
      this.emulatorInstance.reset()
    }
  }

  // Convert ArrayBuffer to base64 safely (chunked to avoid stack overflow on large saves)
  _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  // Save state - returns base64 encoded state data
  async saveState() {
    if (!this.emulatorInstance) {
      console.error('[Emulator] No emulator instance for save state')
      return null
    }

    try {
      // EmulatorJS uses EJS_emulator as the global reference
      const emu = window.EJS_emulator || this.emulatorInstance;
      console.log('[Emulator] Attempting save state...')

      // Method 1: gameManager.getState() — the documented EmulatorJS API
      if (emu.gameManager && typeof emu.gameManager.getState === 'function') {
        console.log('[Emulator] Using gameManager.getState()')
        const stateData = await emu.gameManager.getState();
        if (stateData && stateData.byteLength > 0) {
          const base64 = this._arrayBufferToBase64(stateData);
          console.log('[Emulator] ✅ State saved via getState(), size:', stateData.byteLength);
          return base64;
        }
      }

      // Method 2: gameManager.saveState() — alternative API
      if (emu.gameManager && typeof emu.gameManager.saveState === 'function') {
        console.log('[Emulator] Using gameManager.saveState()')
        const stateData = await emu.gameManager.saveState();
        if (stateData && stateData.byteLength > 0) {
          const base64 = this._arrayBufferToBase64(stateData);
          console.log('[Emulator] ✅ State saved via saveState(), size:', stateData.byteLength);
          return base64;
        }
      }

      // Method 3: Direct save method on emulator instance
      if (typeof emu.saveState === 'function') {
        console.log('[Emulator] Using emu.saveState()')
        const stateData = await emu.saveState();
        if (stateData) {
          const raw = stateData instanceof ArrayBuffer ? stateData : 
                      stateData.buffer ? stateData.buffer : stateData;
          if (raw.byteLength > 0) {
            const base64 = this._arrayBufferToBase64(raw);
            console.log('[Emulator] ✅ State saved via direct saveState(), size:', raw.byteLength);
            return base64;
          }
        }
      }

      // Method 4: Check EJS_player global
      if (window.EJS_player && window.EJS_player.gameManager) {
        const gm = window.EJS_player.gameManager;
        if (typeof gm.getState === 'function') {
          console.log('[Emulator] Using EJS_player.gameManager.getState()')
          const stateData = await gm.getState();
          if (stateData && stateData.byteLength > 0) {
            const base64 = this._arrayBufferToBase64(stateData);
            console.log('[Emulator] ✅ State saved via EJS_player, size:', stateData.byteLength);
            return base64;
          }
        }
      }

      console.warn('[Emulator] ❌ Save state API not available on this core yet');
      return null;
    } catch (error) {
      console.error('[Emulator] Error saving state:', error);
      return null;
    }
  }

  // Load state from data (base64 string or ArrayBuffer)
  async loadState(inputData) {
    if (!this.emulatorInstance || !inputData) {
      console.error('[Emulator] No emulator instance or state data')
      return false
    }

    try {
      let stateData

      // Normalize ALL inputs to Uint8Array — EmulatorJS requires this exact type
      if (typeof inputData === 'string') {
        // Base64 string → Uint8Array
        const binaryString = atob(inputData)
        stateData = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          stateData[i] = binaryString.charCodeAt(i)
        }
      } else if (inputData instanceof ArrayBuffer || inputData?.constructor?.name === 'ArrayBuffer') {
        stateData = new Uint8Array(inputData)
      } else if (inputData instanceof Uint8Array || inputData?.constructor?.name === 'Uint8Array') {
        stateData = inputData
      } else if (inputData && (inputData.buffer instanceof ArrayBuffer || inputData.buffer?.constructor?.name === 'ArrayBuffer')) {
        // TypedArray or similar buffer-backed object
        stateData = new Uint8Array(inputData.buffer)
      } else if (inputData && typeof inputData === 'object' && typeof inputData.toUint8Array === 'function') {
        // Firestore Bytes object
        stateData = inputData.toUint8Array()
      } else if (inputData && typeof inputData === 'object' && inputData.byteLength !== undefined) {
        // Generic buffer-like object
        stateData = new Uint8Array(inputData)
      } else {
        console.error('[Emulator] Unknown state data type:', typeof inputData, inputData?.constructor?.name)
        if (inputData) console.log('[Emulator] Corrupted object detail:', inputData)
        return false
      }

      console.log('[Emulator] Loading state, size:', stateData.byteLength, 'bytes')
      const emu = window.EJS_emulator || this.emulatorInstance;

      // Method 1: gameManager.loadState() — the standard API
      if (emu.gameManager && typeof emu.gameManager.loadState === 'function') {
        await emu.gameManager.loadState(stateData)
        console.log('[Emulator] ✅ State loaded via gameManager.loadState()')
        return true
      }

      // Method 2: Direct loadState on emulator
      if (typeof emu.loadState === 'function') {
        await emu.loadState(stateData)
        console.log('[Emulator] ✅ State loaded via emu.loadState()')
        return true
      }

      // Method 3: EJS_player fallback
      if (window.EJS_player && window.EJS_player.gameManager) {
        await window.EJS_player.gameManager.loadState(stateData)
        console.log('[Emulator] ✅ State loaded via EJS_player')
        return true
      }

      console.warn('[Emulator] Load state API not available')
      return false
    } catch (error) {
      console.error('[Emulator] Error loading state:', error)
      return false
    }
  }

  destroy() {
    console.log('Destroying emulator instance')

    // Stop the emulator completely
    if (this.emulatorInstance) {
      try {
        // Try all possible stop methods
        if (this.emulatorInstance.stop) this.emulatorInstance.stop()
        if (this.emulatorInstance.pause) this.emulatorInstance.pause()
        if (this.emulatorInstance.destroy) this.emulatorInstance.destroy()
        if (this.emulatorInstance.exit) this.emulatorInstance.exit()
      } catch (error) {
        console.error('Error stopping emulator:', error)
      }
      this.emulatorInstance = null
    }

    // DECISIVE CLEANUP: Kill the globals that cause the "classList" error in their loop
    if (window.EJS_player) {
      try {
        // Stop their internal loops if possible
        if (window.EJS_player.stop) window.EJS_player.stop();
        window.EJS_player = null;
      } catch (e) {}
    }
    
    // Clear all potential EmulatorJS globals
    const ejsGlobals = ['EJS_gameUrl', 'EJS_core', 'EJS_system', 'EJS_onSaveState', 'EJS_onLoadState'];
    ejsGlobals.forEach(g => { if (window[g]) window[g] = null; });

    // Remove the emulator div completely
    if (this.emulatorDiv) {
      console.log('Removing specific emulator div');
      // Remove all child elements first
      while (this.emulatorDiv.firstChild) {
        try {
          this.emulatorDiv.removeChild(this.emulatorDiv.firstChild)
        } catch (e) { break; }
      }
      this.emulatorDiv.remove()
      this.emulatorDiv = null
    }

    // Revoke the blob URL to free memory
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }

    // Show canvas again
    if (this.canvas) {
      this.canvas.style.display = 'block'
    }

    // console.log('Emulator destroyed completely')
  }
}

export default GBAEmulator;

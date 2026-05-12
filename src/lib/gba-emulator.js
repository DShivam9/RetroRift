// GBA Emulator using EmulatorJS (local)
class GBAEmulator {
  constructor(canvas, system = 'gba') {
    this.canvas = canvas;
    this.system = system;
    this.container = canvas.parentElement;
    this.emulatorDiv = null;
    this.emulatorInstance = null;
    // console.log(`GBAEmulator initialized for system: ${system}`);

    // Patch: Guard against EmulatorJS's broken setImmediate polyfill
    if (!window.__ejsSetImmediatePatched) {
      window.__ejsSetImmediatePatched = true;
      
      // Some versions of EmulatorJS use a global setImmediates array
      // We monitor it and ensure no null/undefined values enter the queue
      const originalSetImmediate = window.setImmediate;
      if (originalSetImmediate) {
        window.setImmediate = function(fn, ...args) {
          if (typeof fn === 'function') {
            return originalSetImmediate.call(window, fn, ...args);
          }
          return 0;
        };
      }

      // Intercept the message event that triggers the polyfill
      const origAddEventListener = window.addEventListener;
      window.addEventListener = function(type, listener, options) {
        if (type === 'message') {
          const wrappedListener = function(e) {
            try {
              // If we detect the broken setImmediates state, we clean it
              if (window.setImmediates && Array.isArray(window.setImmediates)) {
                // Filter out non-functions to prevent the ".shift(...) is not a function" error
                for (let i = 0; i < window.setImmediates.length; i++) {
                  if (typeof window.setImmediates[i] !== 'function') {
                    window.setImmediates.splice(i, 1);
                    i--;
                  }
                }
              }
              return listener.apply(this, arguments);
            } catch (err) {
              if (err.message && err.message.includes('setImmediates.shift')) {
                // Silently swallow this specific EmulatorJS error
                return;
              }
              throw err;
            }
          };
          return origAddEventListener.call(this, type, wrappedListener, options);
        }
        return origAddEventListener.call(this, type, listener, options);
      };
    }
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

  async loadROM(arrayBuffer) {
    console.log('ROM received:', arrayBuffer.byteLength, 'bytes');

    const assetsReady = await this.ensureAssets();
    if (!assetsReady) {
      console.error('EmulatorJS assets not available after load attempt');
      return false;
    }

    try {
      // Hide canvas – EmulatorJS manages its own DOM
      this.canvas.style.display = 'none';

      // Create emulator container
      this.emulatorDiv = document.createElement('div');
      this.emulatorDiv.id = 'game';
      this.emulatorDiv.style.width = '100%';
      this.emulatorDiv.style.height = '100%';
      this.container.appendChild(this.emulatorDiv);

      // Convert ArrayBuffer to Blob URL
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      this.blobUrl = URL.createObjectURL(blob);

      // Use main branch for better core compatibility
      const dataPath = 'https://cdn.emulatorjs.org/main/data/';
      console.log('Instantiating EmulatorJS with main dataPath:', dataPath);
      
      // Small delay to ensure DOM is ready and previous instance is cleared
      await new Promise(resolve => setTimeout(resolve, 50));

      this.emulatorInstance = new window.EmulatorJS('#game', {
        system: this.system,
        gameName: `${this.system.toUpperCase()} Game`,
        gameUrl: this.blobUrl,
        dataPath: dataPath,
        biosUrl: '',
        startOnLoad: true,
        color: '#06b6d4',
        cheats: false,
        netplay: false,
        debug: false
      });

      console.log('EmulatorJS instance created');
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
      } else if (inputData instanceof ArrayBuffer) {
        stateData = new Uint8Array(inputData)
      } else if (inputData instanceof Uint8Array) {
        stateData = inputData
      } else if (inputData?.buffer instanceof ArrayBuffer) {
        // TypedArray view
        stateData = new Uint8Array(inputData.buffer)
      } else {
        console.error('[Emulator] Unknown state data type:', typeof inputData)
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

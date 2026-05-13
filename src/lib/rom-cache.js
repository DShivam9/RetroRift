/**
 * ROM Cache utility using IndexedDB to store external ROMs locally.
 * This significantly improves loading times for large ROMs after the first download.
 */

const DB_NAME = 'RetroPlayROMCache';
const DB_VERSION = 1;
const STORE_NAME = 'roms';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const getCachedROM = async (gameId) => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(gameId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('ROM Cache read failed:', err);
    return null;
  }
};

export const setCachedROM = async (gameId, arrayBuffer) => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(arrayBuffer, gameId);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('ROM Cache write failed:', err);
    return false;
  }
};

export const deleteCachedROM = async (gameId) => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(gameId);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('ROM Cache delete failed:', err);
    return false;
  }
};

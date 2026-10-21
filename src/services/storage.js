const DATABASE_NAME = 'ayomasak-local';
const DATABASE_VERSION = 1;
const STORE_NAME = 'app-state';
const MIGRATED_KEYS = ['ayoMasakProgress', 'ayoMasakAudioSettings'];

let database;
const cache = new Map();
const pendingWrites = new Set();
const channel = typeof BroadcastChannel === 'function'
  ? new BroadcastChannel('ayomasak-local-state')
  : null;

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener('error', () => reject(request.error || new Error('Permintaan IndexedDB gagal.')), { once: true });
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', resolve, { once: true });
    transaction.addEventListener('abort', () => reject(transaction.error || new Error('Transaksi IndexedDB dibatalkan.')), { once: true });
    transaction.addEventListener('error', () => reject(transaction.error || new Error('Transaksi IndexedDB gagal.')), { once: true });
  });
}

function reportStorageError(error, key) {
  console.error(`Gagal menyimpan data${key ? ` "${key}"` : ''} ke IndexedDB.`, error);
  window.dispatchEvent(new CustomEvent('ayo-storage-error', {
    detail: { message: 'Perubahan data belum tersimpan. Periksa ruang penyimpanan browser.' }
  }));
}

async function migrateLegacyValues() {
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const done = transactionDone(transaction);
  const store = transaction.objectStore(STORE_NAME);
  const records = await requestResult(store.getAll());
  const storedKeys = new Set(records.map(record => record.key));
  const migrated = [];

  for (const key of MIGRATED_KEYS) {
    if (storedKeys.has(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value === null) continue;
    store.put({ key, value });
    migrated.push(key);
  }

  await done;
  records.forEach(record => cache.set(record.key, record.value));
  migrated.forEach(key => {
    const value = window.localStorage.getItem(key);
    if (value !== null) cache.set(key, value);
    window.localStorage.removeItem(key);
  });
}

export async function initializeStorage() {
  if (!('indexedDB' in window)) throw new Error('Browser ini tidak mendukung IndexedDB.');

  database = await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener('upgradeneeded', () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    });
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener('error', () => reject(request.error || new Error('Database lokal gagal dibuka.')), { once: true });
    request.addEventListener('blocked', () => reject(new Error('Database lokal sedang diblokir tab lain.')), { once: true });
  });

  database.addEventListener('versionchange', () => database.close());
  await migrateLegacyValues();

  if (channel) {
    channel.addEventListener('message', event => {
      const { key, value } = event.data || {};
      if (typeof key !== 'string' || typeof value !== 'string') return;
      cache.set(key, value);
      window.dispatchEvent(new CustomEvent('ayo-storage-change', { detail: { key, value } }));
    });
  }

  window.AyoStorage = {
    getItem(key) {
      return cache.has(key) ? cache.get(key) : null;
    },
    setItem(key, value) {
      const normalizedValue = String(value);
      cache.set(key, normalizedValue);
      const operation = new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put({ key, value: normalizedValue });
        transaction.addEventListener('complete', resolve, { once: true });
        transaction.addEventListener('abort', () => reject(transaction.error || new Error('Transaksi IndexedDB dibatalkan.')), { once: true });
        transaction.addEventListener('error', () => reject(transaction.error || new Error('Transaksi IndexedDB gagal.')), { once: true });
      });

      pendingWrites.add(operation);
      operation.then(() => {
        if (channel) channel.postMessage({ key, value: normalizedValue });
        window.dispatchEvent(new CustomEvent('ayo-storage-change', { detail: { key, value: normalizedValue } }));
      }).catch(error => reportStorageError(error, key)).finally(() => pendingWrites.delete(operation));
      return operation;
    },
    async flush() {
      await Promise.all([...pendingWrites]);
    }
  };
}

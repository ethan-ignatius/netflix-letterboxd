import type { XraySceneActor } from "../shared/types";
import {
  XRAY_CACHE_DB_NAME,
  XRAY_CACHE_DB_VERSION,
  XRAY_CACHE_STORE,
  XRAY_CACHE_TTL_MS
} from "../shared/constants";

export type XrayCacheEntry = {
  key: string;
  netflixTitleId: string;
  timestampBucket: number;
  storedAt: number;
  actors: XraySceneActor[];
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(XRAY_CACHE_DB_NAME, XRAY_CACHE_DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(XRAY_CACHE_STORE)) {
        const store = db.createObjectStore(XRAY_CACHE_STORE, ["key"]);
        store.createIndex("storedAt", "storedAt", { unique: false });
      }
    };
  });
}

function cacheKey(netflixTitleId: string, timestamp: number): string {
  return `${netflixTitleId}_${Math.floor(timestamp / 2)}`;
}

export async function getXrayCached(
  netflixTitleId: string,
  timestamp: number
): Promise<XraySceneActor[] | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const key = cacheKey(netflixTitleId, timestamp);
    const tx = db.transaction(XRAY_CACHE_STORE, "readonly");
    const store = tx.objectStore(XRAY_CACHE_STORE);
    const req = store.get(key);
    req.onsuccess = () => {
      const entry = req.result as XrayCacheEntry | undefined;
      db.close();
      if (!entry) {
        resolve(null);
        return;
      }
      if (Date.now() - entry.storedAt > XRAY_CACHE_TTL_MS) {
        resolve(null);
        return;
      }
      resolve(entry.actors);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function setXrayCached(
  netflixTitleId: string,
  timestamp: number,
  actors: XraySceneActor[]
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const key = cacheKey(netflixTitleId, timestamp);
    const entry: XrayCacheEntry = {
      key,
      netflixTitleId,
      timestampBucket: Math.floor(timestamp / 2),
      storedAt: Date.now(),
      actors
    };
    const tx = db.transaction(XRAY_CACHE_STORE, "readwrite");
    const store = tx.objectStore(XRAY_CACHE_STORE);
    const req = store.put(entry);
    req.onsuccess = () => {
      db.close();
      resolve();
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

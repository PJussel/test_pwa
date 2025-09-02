import type { Activity } from "../types/Activity";
import { DB_CONFIG } from "../constants";

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => {
        console.error('Error opening database');
        reject(new Error('Could not open database'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const store = db.createObjectStore(DB_CONFIG.store, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      };
    });
  }

  async saveActivity(activity: Activity): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DB_CONFIG.store], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.store);
      
      const request = store.add(activity);
      
      request.onerror = () => reject(new Error('Failed to save activity'));
      transaction.oncomplete = () => resolve();
    });
  }

  async deleteActivity(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DB_CONFIG.store], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.store);
      
      const request = store.delete(id);
      
      request.onerror = () => reject(new Error('Failed to delete activity'));
      transaction.oncomplete = () => resolve();
    });
  }

  async getActivitiesByDate(date: string): Promise<Activity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DB_CONFIG.store], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.store);
      const dateIndex = store.index('date');
      
      const request = dateIndex.getAll(date);
      
      request.onerror = () => reject(new Error('Failed to load activities'));
      request.onsuccess = () => resolve(request.result);
    });
  }
}

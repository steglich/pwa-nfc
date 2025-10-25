import { Injectable } from '@angular/core';

/**
 * IndexedDBService
 * - Cria e configura o banco (versão 1, store "records")
 * - Métodos: getAll, add, delete
 */
@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private readonly dbName = 'app-db';
  private readonly storeName = 'records';
  private dbPromise: Promise<IDBDatabase> | null = null;

  private ensureSupported(): void {
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB não é suportado neste ambiente.');
    }
  }

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.ensureSupported();

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async getAll<T = any>(): Promise<T[]> {
    const db = await this.openDB();
    return new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async add<T extends Record<string, any>>(record: T): Promise<IDBValidKey> {
    const db = await this.openDB();
    return new Promise<IDBValidKey>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.add(record);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(id: IDBValidKey): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
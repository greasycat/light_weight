import { Repository, IDItem } from "../interfaces/repository";

export class IndexDBRepository<T extends IDItem> implements Repository<T> {
    private dbName: string;
    private storeName: string;
    private dbPromise: Promise<IDBDatabase>;

    constructor(dbName: string, storeName: string, upgradeCallback: (db: IDBDatabase) => void) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.dbPromise = this.openOrUpgrade(upgradeCallback);
    }

    async openOrUpgrade(upgradeCallback: (db: IDBDatabase) => void): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(this.dbName);
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                upgradeCallback(db);
            }

            openRequest.onsuccess = () => {
                const db = openRequest.result as IDBDatabase;
                db.onclose = () => {
                    console.log('IndexDBRepository: Database closed');
                }
                db.onerror = (event: Event) => {
                    console.error('IndexDBRepository: Database error:', (event.target as IDBRequest).error);
                }
                resolve(db);

            }

            openRequest.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            }
        })
    }

    async add(item: T): Promise<T> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            const request = store.add(item);

            request.onsuccess = () => {
                const id = request.result as IDBValidKey;
                const itemWithId = { ...item, id };
                resolve(itemWithId as T);
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    
    }

    async update(item: T): Promise<T> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            const request = store.put(item);

            request.onsuccess = () => {
                resolve(item);
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    }

    async delete(item: T): Promise<void> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            const request = store.delete(item.id);

            request.onsuccess = () => {
                resolve();
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    }

    async get(index: IDBValidKey, indexName: string | "key"): Promise<T> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            let request: IDBRequest<T>;

            if (indexName === "key") {
                request = store.get(index);
            } else {
                request = store.index(indexName).get(index);
            }

            request.onsuccess = () => {
                resolve(request.result as T);
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    }



    async getRange(index: IDBValidKey | IDBKeyRange, indexName: string | "key"): Promise<T[]> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);

            let request: IDBRequest<T[]>;

            if (indexName === "key") {
                request = store.getAll(index);
            } else {
                request = store.index(indexName).getAll(index);
            }

            request.onsuccess = () => {
                resolve(request.result as T[]);
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    }

    async getAll(indexName: string | "key"): Promise<T[]> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            let request: IDBRequest<T[]>;

            if (indexName === "key") {
                request = store.getAll();
            } else {
                request = store.index(indexName).getAll();
            }

            request.onsuccess = () => {
                resolve(request.result as T[]);
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    }

    async getLast(indexName: string | "key"): Promise<T | null> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            const request = store.openCursor(null, 'prev');

            request.onsuccess = () => {
                const cursor = request.result
                if (cursor) {
                    resolve(cursor.value as T);
                } else {
                    resolve(null);
                }
            }
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
        })
    }

    async getAnyMatchedMultiEntries(targets: IDBValidKey[], indexName: string): Promise<T[]> {
        const db = await this.dbPromise
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            transaction.onabort = () => reject(new Error('Transaction aborted'));
            transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error);

            const store = transaction.objectStore(this.storeName);
            const index = store.index(indexName);
            const items = new Set();
          
          let completed = 0;
          targets.forEach(target => {
            index.getAll(target).onsuccess = (event: Event) => {
              (event.target as IDBRequest<T[]>).result.forEach(item => items.add(item));
              if (++completed === targets.length) {
                resolve(Array.from(items) as T[]);
              }
            };
          });
        });
      }
}
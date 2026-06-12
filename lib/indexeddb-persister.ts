import { set, get, del } from 'idb-keyval';
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client';

/**
 * Creates an IndexedDB persister for React Query.
 * Uses idb-keyval for a lightweight Promise-based API over IndexedDB.
 */
export function createIndexedDBPersister(idbValidKey: IDBValidKey = 'reactQuery'): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(idbValidKey, client);
      } catch (error) {
        console.error('Error persisting React Query to IndexedDB:', error);
      }
    },
    restoreClient: async () => {
      try {
        const client = await get<PersistedClient>(idbValidKey);
        return client;
      } catch (error) {
        console.error('Error restoring React Query from IndexedDB:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbValidKey);
      } catch (error) {
        console.error('Error removing React Query from IndexedDB:', error);
      }
    },
  };
}

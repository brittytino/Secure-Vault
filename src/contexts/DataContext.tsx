import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeData, getData, removeData, listData, logAuditEvent } from '../utils/storage';
import { useCrypto } from './CryptoContext';
import { useAuth } from './AuthContext';

interface DataItem {
  id: string;
  name: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  data: any;
}

interface DataContextType {
  items: DataItem[];
  isLoading: boolean;
  error: string | null;
  createItem: (item: Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  getItem: (id: string) => Promise<DataItem | null>;
  updateItem: (id: string, updates: Partial<Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  refreshItems: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  items: [],
  isLoading: false,
  error: null,
  createItem: async () => null,
  getItem: async () => null,
  updateItem: async () => false,
  deleteItem: async () => false,
  refreshItems: async () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { encrypt, decrypt } = useCrypto();
  const { isAuthenticated } = useAuth();

  // Load items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshItems();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  // Refresh the list of items
  const refreshItems = async (): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const itemIds = await listData();
      const loadedItems: DataItem[] = [];

      for (const id of itemIds) {
        const encryptedItem = await getData(id);
        if (encryptedItem) {
          const decryptedItem = await decrypt(encryptedItem.ciphertext, encryptedItem.iv);
          if (decryptedItem) {
            loadedItems.push({
              id,
              ...decryptedItem,
            });
          }
        }
      }

      // Sort by updatedAt (newest first)
      loadedItems.sort((a, b) => b.updatedAt - a.updatedAt);
      setItems(loadedItems);
    } catch (error) {
      console.error('Failed to load items:', error);
      setError('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new item
  const createItem = async (
    item: Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    if (!isAuthenticated) return null;

    setIsLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const id = `item_${now}_${Math.random().toString(36).substring(2, 9)}`;
      
      const newItem = {
        ...item,
        createdAt: now,
        updatedAt: now,
      };

      const encrypted = await encrypt(newItem);
      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      await storeData(id, encrypted);
      
      // Log the creation
      await logAuditEvent({
        type: 'ITEM_CREATE',
        timestamp: now,
        details: { id, type: item.type },
      });

      // Refresh the list
      await refreshItems();
      
      return id;
    } catch (error) {
      console.error('Failed to create item:', error);
      setError('Failed to create item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific item
  const getItem = async (id: string): Promise<DataItem | null> => {
    if (!isAuthenticated) return null;

    setIsLoading(true);
    setError(null);

    try {
      const encryptedItem = await getData(id);
      if (!encryptedItem) {
        return null;
      }

      const decryptedItem = await decrypt(encryptedItem.ciphertext, encryptedItem.iv);
      if (!decryptedItem) {
        return null;
      }

      return {
        id,
        ...decryptedItem,
      };
    } catch (error) {
      console.error('Failed to get item:', error);
      setError('Failed to get item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing item
  const updateItem = async (
    id: string,
    updates: Partial<Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Get the current item
      const encryptedItem = await getData(id);
      if (!encryptedItem) {
        throw new Error('Item not found');
      }

      const currentItem = await decrypt(encryptedItem.ciphertext, encryptedItem.iv);
      if (!currentItem) {
        throw new Error('Failed to decrypt item');
      }

      // Update the item
      const updatedItem = {
        ...currentItem,
        ...updates,
        updatedAt: Date.now(),
      };

      // Encrypt and store the updated item
      const encrypted = await encrypt(updatedItem);
      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      await storeData(id, encrypted);
      
      // Log the update
      await logAuditEvent({
        type: 'ITEM_UPDATE',
        timestamp: Date.now(),
        details: { id },
      });

      // Refresh the list
      await refreshItems();
      
      return true;
    } catch (error) {
      console.error('Failed to update item:', error);
      setError('Failed to update item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an item
  const deleteItem = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await removeData(id);
      
      // Log the deletion
      await logAuditEvent({
        type: 'ITEM_DELETE',
        timestamp: Date.now(),
        details: { id },
      });

      // Refresh the list
      await refreshItems();
      
      return true;
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        items,
        isLoading,
        error,
        createItem,
        getItem,
        updateItem,
        deleteItem,
        refreshItems,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
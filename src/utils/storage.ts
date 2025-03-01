import localforage from 'localforage';

// Initialize localforage instances for different storage needs
const keyStore = localforage.createInstance({
  name: 'secureVault',
  storeName: 'keyStore',
});

const dataStore = localforage.createInstance({
  name: 'secureVault',
  storeName: 'dataStore',
});

const metaStore = localforage.createInstance({
  name: 'secureVault',
  storeName: 'metaStore',
});

const auditStore = localforage.createInstance({
  name: 'secureVault',
  storeName: 'auditStore',
});

// Key Storage
export async function storeKey(keyId: string, keyData: string): Promise<void> {
  await keyStore.setItem(keyId, keyData);
}

export async function getKey(keyId: string): Promise<string | null> {
  return keyStore.getItem<string>(keyId);
}

export async function removeKey(keyId: string): Promise<void> {
  await keyStore.removeItem(keyId);
}

export async function listKeys(): Promise<string[]> {
  const keys: string[] = [];
  await keyStore.iterate((value, key) => {
    keys.push(key);
  });
  return keys;
}

// Data Storage
export async function storeData(dataId: string, encryptedData: any): Promise<void> {
  await dataStore.setItem(dataId, encryptedData);
}

export async function getData(dataId: string): Promise<any> {
  return dataStore.getItem(dataId);
}

export async function removeData(dataId: string): Promise<void> {
  await dataStore.removeItem(dataId);
}

export async function listData(): Promise<string[]> {
  const dataIds: string[] = [];
  await dataStore.iterate((value, key) => {
    dataIds.push(key);
  });
  return dataIds;
}

// Metadata Storage
export async function storeMeta(metaId: string, metadata: any): Promise<void> {
  await metaStore.setItem(metaId, metadata);
}

export async function getMeta(metaId: string): Promise<any> {
  return metaStore.getItem(metaId);
}

export async function updateMeta(metaId: string, updates: any): Promise<void> {
  const existing = await getMeta(metaId) || {};
  await metaStore.setItem(metaId, { ...existing, ...updates });
}

// Audit Log Storage
export async function logAuditEvent(event: {
  type: string;
  timestamp: number;
  details: any;
}): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await auditStore.setItem(logId, event);
}

export async function getAuditLogs(limit = 100, offset = 0): Promise<any[]> {
  const logs: any[] = [];
  let count = 0;
  let skipped = 0;
  
  await auditStore.iterate((value, key) => {
    if (skipped < offset) {
      skipped++;
      return;
    }
    
    if (count < limit) {
      logs.push({ id: key, ...value });
      count++;
    }
  });
  
  // Sort logs by timestamp (newest first)
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

// Export data
export async function exportVaultData(): Promise<string> {
  const exportData = {
    meta: {},
    data: {},
    timestamp: Date.now(),
  };
  
  // Export metadata
  await metaStore.iterate((value, key) => {
    exportData.meta[key] = value;
  });
  
  // Export encrypted data
  await dataStore.iterate((value, key) => {
    exportData.data[key] = value;
  });
  
  return JSON.stringify(exportData);
}

// Import data
export async function importVaultData(jsonData: string): Promise<void> {
  try {
    const importData = JSON.parse(jsonData);
    
    // Import metadata
    for (const [key, value] of Object.entries(importData.meta)) {
      await metaStore.setItem(key, value);
    }
    
    // Import encrypted data
    for (const [key, value] of Object.entries(importData.data)) {
      await dataStore.setItem(key, value);
    }
    
    // Log the import
    await logAuditEvent({
      type: 'IMPORT',
      timestamp: Date.now(),
      details: {
        timestamp: importData.timestamp,
        metaCount: Object.keys(importData.meta).length,
        dataCount: Object.keys(importData.data).length,
      },
    });
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error('Failed to import data. The file may be corrupted.');
  }
}

// Clear all data (for testing or reset)
export async function clearAllData(): Promise<void> {
  await Promise.all([
    keyStore.clear(),
    dataStore.clear(),
    metaStore.clear(),
    auditStore.clear(),
  ]);
}

// Check if the vault is initialized
export async function isVaultInitialized(): Promise<boolean> {
  const initStatus = await metaStore.getItem('vaultInitialized');
  return initStatus === true;
}

// Set vault as initialized
export async function setVaultInitialized(): Promise<void> {
  await metaStore.setItem('vaultInitialized', true);
}
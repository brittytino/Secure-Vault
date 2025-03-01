/**
 * Crypto utility functions for secure offline vault
 * Using Web Crypto API for AES-256-GCM encryption/decryption
 */

// Generate a new encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

// Export key to raw format for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from raw format
export async function importKey(keyData: string): Promise<CryptoKey> {
  const rawKey = base64ToArrayBuffer(keyData);
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Derive a key from a password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive the key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a random salt
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// Encrypt data
export async function encryptData(
  data: any,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    dataBuffer
  );
  
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
  };
}

// Decrypt data
export async function decryptData(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<any> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
  const ivBuffer = base64ToArrayBuffer(iv);
  
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      ciphertextBuffer
    );
    
    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. The key may be incorrect.');
  }
}

// Generate a random value for chaff data
export function generateChaffValue(fieldType: string): any {
  switch (fieldType) {
    case 'string':
      return generateRandomString(8 + Math.floor(Math.random() * 8));
    case 'number':
      return Math.floor(Math.random() * 1000);
    case 'boolean':
      return Math.random() > 0.5;
    case 'date':
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
      return randomDate.toISOString();
    default:
      return generateRandomString(10);
  }
}

// Add chaff to data
export function addChaffToData(data: Record<string, any>, chaffRatio = 3): Record<string, any> {
  const result: Record<string, any> = {};
  const allKeys: string[] = [];
  
  // First, add chaff for each real field
  Object.entries(data).forEach(([key, value]) => {
    // Add the real data
    const realKey = `${key}_${generateRandomString(4)}`;
    result[realKey] = { value, isReal: true };
    allKeys.push(realKey);
    
    // Add chaff data
    for (let i = 0; i < chaffRatio; i++) {
      const chaffKey = `${key}_${generateRandomString(4)}`;
      const fieldType = typeof value;
      result[chaffKey] = { 
        value: generateChaffValue(fieldType), 
        isReal: false 
      };
      allKeys.push(chaffKey);
    }
  });
  
  // Shuffle the keys
  shuffleArray(allKeys);
  
  // Create the final object with shuffled keys
  const shuffledResult: Record<string, any> = {};
  allKeys.forEach((key, index) => {
    shuffledResult[`field_${index}`] = result[key];
  });
  
  return shuffledResult;
}

// Remove chaff from data
export function removeChaffFromData(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.values(data).forEach((item: any) => {
    if (item.isReal) {
      // Extract the original key from the key with random suffix
      const keyParts = Object.keys(item)[0].split('_');
      keyParts.pop(); // Remove the random suffix
      const originalKey = keyParts.join('_');
      
      result[originalKey] = item.value;
    }
  });
  
  return result;
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}

function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const randomValues = new Uint8Array(1);
    window.crypto.getRandomValues(randomValues);
    const j = Math.floor((randomValues[0] / 255) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
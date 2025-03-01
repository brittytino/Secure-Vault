import { generateSalt, deriveKeyFromPassword, exportKey, importKey } from './crypto';
import { storeKey, getKey, storeMeta, getMeta, logAuditEvent } from './storage';

// Check if WebAuthn is available
export function isWebAuthnAvailable(): boolean {
  return window.PublicKeyCredential !== undefined;
}

// Initialize user authentication
export async function initializeAuth(password: string): Promise<boolean> {
  try {
    // Generate a salt for key derivation
    const salt = generateSalt();
    const saltBase64 = Array.from(salt)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Derive a master key from the password
    const masterKey = await deriveKeyFromPassword(password, salt);
    const masterKeyExported = await exportKey(masterKey);
    
    // Store the master key and salt
    await storeKey('masterKey', masterKeyExported);
    await storeMeta('authSalt', saltBase64);
    
    // Set last key rotation date
    await storeMeta('lastKeyRotation', Date.now());
    
    // Log the initialization
    await logAuditEvent({
      type: 'AUTH_INIT',
      timestamp: Date.now(),
      details: { success: true },
    });
    
    return true;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    
    // Log the failure
    await logAuditEvent({
      type: 'AUTH_INIT',
      timestamp: Date.now(),
      details: { success: false, error: (error as Error).message },
    });
    
    return false;
  }
}

// Authenticate user with password
export async function authenticateWithPassword(password: string): Promise<{ success: boolean; key?: CryptoKey }> {
  try {
    // Get the salt
    const saltBase64 = await getMeta('authSalt');
    if (!saltBase64) {
      throw new Error('Authentication data not found');
    }
    
    // Convert salt from hex string to Uint8Array
    const salt = new Uint8Array(
      saltBase64.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    // Derive the key from the password
    const derivedKey = await deriveKeyFromPassword(password, salt);
    const derivedKeyExported = await exportKey(derivedKey);
    
    // Get the stored master key
    const storedMasterKey = await getKey('masterKey');
    if (!storedMasterKey) {
      throw new Error('Master key not found');
    }
    
    // Compare the keys (timing-safe comparison would be better in production)
    const isAuthenticated = derivedKeyExported === storedMasterKey;
    
    // Log the authentication attempt
    await logAuditEvent({
      type: 'AUTH_ATTEMPT',
      timestamp: Date.now(),
      details: { success: isAuthenticated },
    });
    
    if (isAuthenticated) {
      // Import the master key for use
      const masterKey = await importKey(storedMasterKey);
      
      // Check if key rotation is needed (30 days)
      const lastRotation = await getMeta('lastKeyRotation') || 0;
      const daysSinceRotation = (Date.now() - lastRotation) / (1000 * 60 * 60 * 24);
      
      if (daysSinceRotation >= 30) {
        // TODO: Implement key rotation logic
        await storeMeta('lastKeyRotation', Date.now());
      }
      
      return { success: true, key: masterKey };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Authentication failed:', error);
    
    // Log the error
    await logAuditEvent({
      type: 'AUTH_ERROR',
      timestamp: Date.now(),
      details: { error: (error as Error).message },
    });
    
    return { success: false };
  }
}

// Check if authentication is needed
export async function isAuthRequired(): Promise<boolean> {
  const masterKey = await getKey('masterKey');
  return masterKey !== null;
}

// Mock WebAuthn for development (in production, use the real WebAuthn API)
export async function registerWebAuthn(username: string): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    console.warn('WebAuthn is not available in this browser');
    return false;
  }
  
  try {
    // In a real implementation, this would use the WebAuthn API
    // For now, we'll just store a flag indicating WebAuthn is registered
    await storeMeta('webauthnRegistered', true);
    await storeMeta('webauthnUsername', username);
    
    return true;
  } catch (error) {
    console.error('WebAuthn registration failed:', error);
    return false;
  }
}

// Mock WebAuthn authentication
export async function authenticateWithWebAuthn(): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    console.warn('WebAuthn is not available in this browser');
    return false;
  }
  
  try {
    // In a real implementation, this would use the WebAuthn API
    // For now, we'll just check if WebAuthn is registered
    const isRegistered = await getMeta('webauthnRegistered');
    
    // Log the authentication attempt
    await logAuditEvent({
      type: 'WEBAUTHN_AUTH',
      timestamp: Date.now(),
      details: { success: isRegistered === true },
    });
    
    return isRegistered === true;
  } catch (error) {
    console.error('WebAuthn authentication failed:', error);
    return false;
  }
}
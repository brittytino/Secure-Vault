import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthRequired, authenticateWithPassword, initializeAuth } from '../utils/auth';
import { isVaultInitialized, setVaultInitialized } from '../utils/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  masterKey: CryptoKey | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  initialize: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  masterKey: null,
  login: async () => false,
  logout: () => {},
  initialize: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  // Check if the vault is initialized on mount
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const initialized = await isVaultInitialized();
        setIsInitialized(initialized);
        
        // If initialized, check if auth is required
        if (initialized) {
          const authRequired = await isAuthRequired();
          if (!authRequired) {
            // If no auth is required, the user is automatically authenticated
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Failed to check initialization status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialization();
  }, []);

  // Initialize the vault
  const initialize = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await initializeAuth(password);
      if (success) {
        await setVaultInitialized();
        setIsInitialized(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Initialization failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with password
  const login = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { success, key } = await authenticateWithPassword(password);
      if (success && key) {
        setIsAuthenticated(true);
        setMasterKey(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setMasterKey(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        isLoading,
        masterKey,
        login,
        logout,
        initialize,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
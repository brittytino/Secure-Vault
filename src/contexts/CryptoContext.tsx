import React, { createContext, useContext, useState } from 'react';
import { 
  encryptData, 
  decryptData, 
  addChaffToData, 
  removeChaffFromData 
} from '../utils/crypto';
import { useAuth } from './AuthContext';

interface CryptoContextType {
  encrypt: (data: any) => Promise<{ ciphertext: string; iv: string } | null>;
  decrypt: (ciphertext: string, iv: string) => Promise<any | null>;
  addChaff: (data: Record<string, any>, ratio?: number) => Record<string, any>;
  removeChaff: (data: Record<string, any>) => Record<string, any>;
  chaffRatio: number;
  setChaffRatio: (ratio: number) => void;
}

const CryptoContext = createContext<CryptoContextType>({
  encrypt: async () => null,
  decrypt: async () => null,
  addChaff: () => ({}),
  removeChaff: () => ({}),
  chaffRatio: 3,
  setChaffRatio: () => {},
});

export const useCrypto = () => useContext(CryptoContext);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { masterKey } = useAuth();
  const [chaffRatio, setChaffRatio] = useState(3);

  // Encrypt data using the master key
  const encrypt = async (data: any): Promise<{ ciphertext: string; iv: string } | null> => {
    if (!masterKey) {
      console.error('No master key available for encryption');
      return null;
    }

    try {
      return await encryptData(data, masterKey);
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  // Decrypt data using the master key
  const decrypt = async (ciphertext: string, iv: string): Promise<any | null> => {
    if (!masterKey) {
      console.error('No master key available for decryption');
      return null;
    }

    try {
      return await decryptData(ciphertext, iv, masterKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  // Add chaff to data
  const addChaff = (data: Record<string, any>, ratio = chaffRatio): Record<string, any> => {
    return addChaffToData(data, ratio);
  };

  // Remove chaff from data
  const removeChaff = (data: Record<string, any>): Record<string, any> => {
    return removeChaffFromData(data);
  };

  return (
    <CryptoContext.Provider
      value={{
        encrypt,
        decrypt,
        addChaff,
        removeChaff,
        chaffRatio,
        setChaffRatio,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};
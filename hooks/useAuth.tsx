import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as cryptoService from '../services/cryptoService';

interface AuthContextType {
  isAuthenticated: boolean;
  encryptionKey: string | null;
  login: (password: string) => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const login = async (password: string): Promise<boolean> => {
    // In a real app, you'd verify the password against a stored hash
    // or use it to decrypt a "key blob" from the server to verify it's correct.
    // For this zero-knowledge model, the password itself is the key to local data.
    const key = cryptoService.deriveKey(password);
    setEncryptionKey(key);
    // Here we just assume success if a key is derived.
    return true;
  };
  
  const loginWithBiometrics = async (): Promise<boolean> => {
    // This is a mock. A real implementation would use the WebAuthn API
    // to verify the user and retrieve a stored key/token.
    console.log("Attempting biometric login...");
    try {
        // We will just use a mock key for this demo. In a real app, the private key
        // from webauthn would be used to decrypt a stored encryption key.
        const mockPassword = "password123"; // A pre-agreed upon password for biometric mock
        const key = cryptoService.deriveKey(mockPassword);
        setEncryptionKey(key);
        console.log("Biometric login successful (mock).");
        return true;
    } catch (err) {
        console.error("Biometric login failed (mock):", err);
        return false;
    }
  };

  const logout = () => {
    setEncryptionKey(null);
  };

  const value = {
    isAuthenticated: !!encryptionKey,
    encryptionKey,
    login,
    loginWithBiometrics,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
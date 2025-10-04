import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// TODO: Remove hardcoded key before production deployment
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-test-key-12345';
const CONTROL_PLANE_URL = import.meta.env.VITE_CONTROL_PLANE_URL || 'http://localhost:3000';
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== 'false'; // Default to enabled

interface AuthContextType {
  isAuthenticated: boolean;
  apiKey: string | null;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
  isAuthEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth is disabled - if so, auto-authenticate
    if (!AUTH_ENABLED) {
      setApiKey(API_KEY);
      setIsAuthenticated(true);
      return;
    }

    // Check for existing auth in localStorage
    const storedKey = localStorage.getItem('interrealm_api_key');
    if (storedKey) {
      validateApiKey(storedKey).then((isValid) => {
        if (isValid) {
          setApiKey(storedKey);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('interrealm_api_key');
        }
      });
    }
  }, []);

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${CONTROL_PLANE_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const login = async (key: string): Promise<boolean> => {
    const isValid = await validateApiKey(key);
    if (isValid) {
      setApiKey(key);
      setIsAuthenticated(true);
      localStorage.setItem('interrealm_api_key', key);
      return true;
    }
    return false;
  };

  const logout = () => {
    setApiKey(null);
    setIsAuthenticated(false);
    localStorage.removeItem('interrealm_api_key');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      apiKey,
      login,
      logout,
      isAuthEnabled: AUTH_ENABLED
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
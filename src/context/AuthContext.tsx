import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { SETUP_TOKEN_KEY, clearSetupToken as clearStoredSetupToken } from '../utils/oauth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSetupToken, setHasSetupToken] = useState(
    () => !!localStorage.getItem(SETUP_TOKEN_KEY),
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vora_user');
    localStorage.removeItem('vora_role');
    localStorage.removeItem('auth_token');
    clearStoredSetupToken();
    setHasSetupToken(false);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('vora_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('vora_user');
      }
    }
    setIsLoading(false);

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = useCallback((userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('vora_user', JSON.stringify(userData));
    localStorage.setItem('vora_role', userData.role);
    if (token) {
      localStorage.setItem('auth_token', token);
      clearStoredSetupToken();
      setHasSetupToken(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('vora_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const setSetupToken = useCallback((token: string) => {
    localStorage.setItem(SETUP_TOKEN_KEY, token);
    localStorage.removeItem('auth_token');
    setHasSetupToken(true);
  }, []);

  const clearSetupToken = useCallback(() => {
    clearStoredSetupToken();
    setHasSetupToken(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!localStorage.getItem('auth_token'),
        isLoading,
        hasSetupToken,
        login,
        logout,
        updateUser,
        setSetupToken,
        clearSetupToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { SETUP_TOKEN_KEY, clearSetupToken as clearStoredSetupToken } from '../utils/oauth';
import { isEmailLike, capitalizeName } from '../utils/userName';

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
    localStorage.removeItem('vora_active_assessment_id');
    localStorage.removeItem('active_assessment_role_slug');
    
    // Clear mock assessment keys
    const mockKeys = [
      'vora_stage1_started',
      'vora_stage2_unlocked',
      'vora_stage2_completed',
      'vora_stage3_unlocked',
      'vora_stage3_completed',
      'vora_stage4_unlocked',
      'vora_stage4_completed',
      'vora_stage2_part2_unlocked',
      'vora_stage2_part3_unlocked',
      'vora_stage2_part4_unlocked',
      'vora_hired',
    ];
    mockKeys.forEach(key => localStorage.removeItem(key));

    clearStoredSetupToken();
    setHasSetupToken(false);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('vora_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.firstName) parsed.firstName = capitalizeName(parsed.firstName);
        if (parsed?.lastName) parsed.lastName = capitalizeName(parsed.lastName);
        setUser(parsed);
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
    let finalUserData = userData;
    try {
      const stored = localStorage.getItem('vora_user');
      const candidateFn = localStorage.getItem('candidate_first_name') || localStorage.getItem('user_first_name');
      const incomingHasNoRealName = !userData.firstName || isEmailLike(userData.firstName);

      if (incomingHasNoRealName) {
        if (candidateFn && !isEmailLike(candidateFn)) {
          finalUserData = {
            ...userData,
            firstName: candidateFn,
          };
        } else if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.firstName && !isEmailLike(parsed.firstName)) {
            finalUserData = {
              ...userData,
              firstName: parsed.firstName,
              lastName: parsed.lastName || userData.lastName,
            };
          }
        }
      }
    } catch {}

    if (finalUserData.firstName) {
      finalUserData.firstName = capitalizeName(finalUserData.firstName);
    }
    if (finalUserData.lastName) {
      finalUserData.lastName = capitalizeName(finalUserData.lastName);
    }

    if (finalUserData.firstName && !isEmailLike(finalUserData.firstName)) {
      try {
        localStorage.setItem('candidate_first_name', finalUserData.firstName);
        localStorage.setItem('user_first_name', finalUserData.firstName);
      } catch {}
    }

    setUser(finalUserData);
    localStorage.setItem('vora_user', JSON.stringify(finalUserData));
    localStorage.setItem('vora_role', finalUserData.role);
    if (token) {
      localStorage.setItem('auth_token', token);
      clearStoredSetupToken();
      setHasSetupToken(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      let safeUpdates = { ...updates };
      // Prevent null, undefined, empty, or email-like firstName from wiping an existing real name
      if (
        updates.firstName === undefined ||
        updates.firstName === null ||
        updates.firstName === '' ||
        isEmailLike(updates.firstName)
      ) {
        if (prevUser.firstName && !isEmailLike(prevUser.firstName)) {
          safeUpdates.firstName = prevUser.firstName;
        }
      }

      if (safeUpdates.firstName) {
        safeUpdates.firstName = capitalizeName(safeUpdates.firstName);
      }
      if (safeUpdates.lastName) {
        safeUpdates.lastName = capitalizeName(safeUpdates.lastName);
      }

      const updatedUser = { ...prevUser, ...safeUpdates };

      if (updatedUser.firstName && !isEmailLike(updatedUser.firstName)) {
        try {
          localStorage.setItem('candidate_first_name', updatedUser.firstName);
          localStorage.setItem('user_first_name', updatedUser.firstName);
        } catch {}
      }

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

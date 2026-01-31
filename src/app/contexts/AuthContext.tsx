import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as authApi from '@/app/services/authApi';
import type { UpdateDTO } from '@/app/services/apiTypes';
import { formatApiError } from '@/app/services/apiError';
import { getJwtClaim } from '@/app/services/jwt';

export interface User {
  userId: string;
  displayName: string;
  fullName: string;
  email: string;
  token: string;
  sessionStartedAt: string; // UI-only (backend doesn't expose created date)
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: UpdateDTO) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('auth.currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const dto = await authApi.login({ email, password });
      const userId =
        getJwtClaim(dto.token, 'nameid') ||
        getJwtClaim(dto.token, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier') ||
        '';
      const nextUser: User = {
        userId,
        displayName: dto.displayName,
        fullName: dto.fullName,
        email: dto.email,
        token: dto.token,
        sessionStartedAt: new Date().toISOString(),
      };
      setUser(nextUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth.currentUser', JSON.stringify(nextUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Login failed') };
    }
  };

  const register = async (input: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const dto = await authApi.register(input);
      const userId =
        getJwtClaim(dto.token, 'nameid') ||
        getJwtClaim(dto.token, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier') ||
        '';
      const nextUser: User = {
        userId,
        displayName: dto.displayName,
        fullName: dto.fullName,
        email: dto.email,
        token: dto.token,
        sessionStartedAt: new Date().toISOString(),
      };
      setUser(nextUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth.currentUser', JSON.stringify(nextUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Registration failed') };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth.currentUser');
  };

  const updateUser = async (userData: UpdateDTO): Promise<{ success: boolean; error?: string }> => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };
    try {
      const ok = await authApi.updateUser(userData, user.token);
      if (!ok) return { success: false, error: 'Update failed' };

      // Backend returns only boolean; keep local display values in sync for UI.
      const updatedUser: User = {
        ...user,
        email: userData.email ?? user.email,
        fullName: userData.fullName ?? user.fullName,
        // Dashboard should keep showing first two names even if full name has more
        displayName: userData.fullName
          ? userData.fullName.split(' ').filter(Boolean).slice(0, 2).join(' ') || user.displayName
          : user.displayName,
      };
      setUser(updatedUser);
      localStorage.setItem('auth.currentUser', JSON.stringify(updatedUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Update failed') };
    }
  };

  const value = useMemo(
    () => ({ user, login, register, logout, updateUser, isAuthenticated }),
    [user, isAuthenticated],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

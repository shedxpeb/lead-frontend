'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { setAccessToken, clearSession, getAccessToken } from '@/core/auth/session';
import { authService, AuthUser, LoginInput, RegisterInput } from './authService';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (input: { email: string; otp: string }) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string, purpose: 'REGISTRATION' | 'FORGOT_PASSWORD') => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (input: { email: string }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (input: { email: string; otp: string; newPassword: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  completePasswordChange: (input: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function extractErrorMessage(err: any, fallback: string): string {
  const raw = err?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string' && raw) return raw;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;

    const initAuth = async () => {
      try {
        // Try to refresh the session using the HttpOnly cookie
        const response = await authService.refresh();
        if (!cancelled) {
          const { accessToken, user: userData } = response;
          setAccessToken(accessToken);
          setUser(userData);
          setStatus('authenticated');
        }
      } catch (error) {
        // Refresh failed - session is invalid or expired
        if (!cancelled) {
          clearSession();
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  const login = async (input: LoginInput) => {
    try {
      const response = await authService.login(input);
      const { accessToken, user: userData } = response;
      setAccessToken(accessToken);
      setUser(userData);
      setStatus('authenticated');
      router.replace('/dashboard/leads');
      return { success: true };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error, 'Login failed') };
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      const response = await authService.register(input);
      const { accessToken, user: userData } = response;
      setAccessToken(accessToken);
      setUser(userData);
      setStatus('authenticated');
      router.replace('/dashboard/leads');
      return { success: true };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error, 'Registration failed') };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    clearSession();
    setUser(null);
    setStatus('unauthenticated');
    queryClient.clear();
    router.replace('/login');
  };

  const verifyOtp = async (input: { email: string; otp: string }) => {
    return { success: true };
  };

  const resendOtp = async (email: string, purpose: 'REGISTRATION' | 'FORGOT_PASSWORD') => {
    return { success: true };
  };

  const forgotPassword = async (input: { email: string }) => {
    return { success: true };
  };

  const resetPassword = async (input: { email: string; otp: string; newPassword: string; confirmPassword: string }) => {
    return { success: true };
  };

  const completePasswordChange = async (input: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    return { success: true };
  };

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    mustChangePassword,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    completePasswordChange,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

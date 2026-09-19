'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  verifyOtp: async () => {},
  resendOtp: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
});

const USER_STORAGE_KEY = 'talentlens_user';
const TOKEN_STORAGE_KEY = 'talentlens_token';

/**
 * Authentication Context Provider for managing user state and authentication methods.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);

        // Verify session validity with backend in background
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'session', token: savedToken }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.user) {
              setUser(data.user);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            }
          })
          .catch((err) => {
            console.warn('[Session Sync Notice]: Could not background-sync session:', err.message);
          });
      }
    } catch (err) {
      console.warn('[Auth Initialization Error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist session to local storage
  const saveSession = useCallback((userData, tokenString) => {
    setUser(userData);
    setToken(tokenString);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenString);
      // Set document cookie
      document.cookie = `talentlens_session=${tokenString}; path=/; max-age=604800; SameSite=Lax`;
    } catch (e) {
      console.error('[Storage Error]:', e);
    }
  }, []);

  /**
   * Log in using Email/Password or Phone SMS OTP.
   */
  const login = async (credentials) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Authentication failed.');
    }

    saveSession(data.user, data.token);
    return data;
  };

  /**
   * Register a new candidate or engineer profile.
   */
  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed.');
    }

    // If registration is complete, save session
    if (data.user && data.token) {
      saveSession(data.user, data.token);
    }

    return data;
  };

  /**
   * Verifies an OTP code for email or phone.
   */
  const verifyOtp = async ({ target, type, code }) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type, code, action: 'verify' }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Verification code failed.');
    }

    return data;
  };

  /**
   * Re-sends a fresh OTP code for email or phone.
   */
  const resendOtp = async ({ target, type }) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type, action: 'resend' }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to resend code.');
    }

    return data;
  };

  /**
   * Sign in with Google OAuth.
   */
  const loginWithGoogle = async (payload) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Google authentication failed.');
    }

    saveSession(data.user, data.token);
    return data;
  };

  /**
   * Log out and clear all sessions.
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      document.cookie = 'talentlens_session=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {
      console.error('[Storage Logout Error]:', e);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  userName: string;
  userEmail: string;
  /** URL to avatar image — falls back to generated initials avatar */
  avatarUrl: string | null;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: UserProfile | null;
  /** Simulates signing in — replace body with real Supabase call */
  login: (email?: string, name?: string) => void;
  /** Simulates signing out */
  logout: () => void;
  /** Simulate switching to a different mock account */
  switchAccount: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const MOCK_ACCOUNTS: UserProfile[] = [
  {
    userName: 'Arjun Sharma',
    userEmail: 'arjun.sharma@campus.edu',
    avatarUrl: null,
  },
  {
    userName: 'Priya Menon',
    userEmail: 'priya.menon@campus.edu',
    avatarUrl: null,
  },
];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accountIndex, setAccountIndex] = useState(0);

  const login = useCallback((email?: string, name?: string) => {
    // -----------------------------------------------------------------------
    // FUTURE: Replace with Supabase authentication
    //
    // import { supabase } from '@/lib/supabase';
    //
    // Sign In:
    //   const { data, error } = await supabase.auth.signInWithPassword({
    //     email,
    //     password,
    //   });
    //   if (error) throw error;
    //   setUser({ userName: data.user.user_metadata.full_name, ... });
    //
    // Sign Up:
    //   const { data, error } = await supabase.auth.signUp({
    //     email,
    //     password,
    //     options: { data: { full_name: name } },
    //   });
    //   if (error) throw error;
    // -----------------------------------------------------------------------

    const profile = email
      ? { userName: name ?? email.split('@')[0], userEmail: email, avatarUrl: null }
      : MOCK_ACCOUNTS[0];

    setUser(profile);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    // FUTURE: await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const switchAccount = useCallback(() => {
    const nextIndex = (accountIndex + 1) % MOCK_ACCOUNTS.length;
    setAccountIndex(nextIndex);
    setUser(MOCK_ACCOUNTS[nextIndex]);
    setIsLoggedIn(true);
  }, [accountIndex]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, switchAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

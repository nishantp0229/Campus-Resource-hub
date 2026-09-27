'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (email?: string, name?: string) => void;
  logout: () => void;
  switchAccount: () => void;
}

// ---------------------------------------------------------------------------
// LocalStorage keys
// ---------------------------------------------------------------------------

const STORAGE_KEY_USER = 'campus_user';
const STORAGE_KEY_ACCOUNT_INDEX = 'campus_account_index';

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
// Helpers — safe localStorage access (SSR-safe)
// ---------------------------------------------------------------------------

function readStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function readStoredIndex(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNT_INDEX);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage so session survives refresh
  const [user, setUser] = useState<UserProfile | null>(() => readStoredUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => readStoredUser() !== null);
  const [accountIndex, setAccountIndex] = useState<number>(() => readStoredIndex());

  // Keep localStorage in sync with state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ACCOUNT_INDEX, String(accountIndex));
  }, [accountIndex]);

  const login = useCallback((email?: string, name?: string) => {
    const profile = email
      ? { userName: name ?? email.split('@')[0], userEmail: email, avatarUrl: null }
      : MOCK_ACCOUNTS[0];

    setUser(profile);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
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
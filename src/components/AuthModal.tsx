'use client';

import { useState } from 'react';
import { X, BookOpen, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after successful (mock) login/signup */
  onSuccess?: () => void;
  /** Start on the signup tab instead of login */
  defaultTab?: 'login' | 'signup';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
}: AuthModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // -----------------------------------------------------------------------
    // FUTURE: Replace with Supabase authentication
    //
    // import { supabase } from '@/lib/supabase';
    //
    // if (tab === 'login') {
    //   const { data, error } = await supabase.auth.signInWithPassword({
    //     email,
    //     password,
    //   });
    //   if (error) { setError(error.message); setIsLoading(false); return; }
    //   // data.user is now available
    // } else {
    //   const { data, error } = await supabase.auth.signUp({
    //     email,
    //     password,
    //     options: { data: { full_name: name } },
    //   });
    //   if (error) { setError(error.message); setIsLoading(false); return; }
    //   // Check data.user.identities?.length === 0 for duplicate email
    // }
    // -----------------------------------------------------------------------

    // Mock: simulate network delay
    await new Promise((res) => setTimeout(res, 800));

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    login(email, tab === 'signup' ? name : undefined);
    setIsLoading(false);
    onSuccess?.();
    onClose();
  };

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t);
    setError(null);
    setPassword('');
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">

        {/* Top accent strip */}
        <div className="h-1 w-full bg-blue-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="p-6">
          {/* Logo + Heading */}
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {tab === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-xs text-slate-500">CampusHub Academic Repository</p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 mb-5">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                tab === 'login'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                tab === 'signup'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name — signup only */}
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    placeholder="Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg shadow-sm transition flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{tab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </span>
              ) : (
                tab === 'login' ? 'Sign In to CampusHub' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-500 mt-4">
            {tab === 'login' ? (
              <>No account?{' '}
                <button onClick={() => switchTab('signup')} className="text-blue-600 hover:underline font-medium">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchTab('login')} className="text-blue-600 hover:underline font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

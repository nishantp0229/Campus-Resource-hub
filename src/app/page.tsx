'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowRight,
  FileText,
  Users,
  Star,
  ChevronUp,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

// ---------------------------------------------------------------------------
// Static feature data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: FileText,
    title: 'Rich Resource Library',
    description:
      'Access notes, past year question papers, lab manuals, and curated web links — all in one place.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description:
      'Resources shared by students and faculty alike. Upvote what helps you, flag what doesn\'t.',
  },
  {
    icon: Star,
    title: 'Smart Bookmarks',
    description:
      'Save your favourite resources to a personal library. Pick up exactly where you left off.',
  },
  {
    icon: ChevronUp,
    title: 'Upvote System',
    description:
      'Surface the best content. Sort by newest or most popular to find what the community trusts.',
  },
  {
    icon: Shield,
    title: 'Department Filters',
    description:
      'Filter by department (CSE, ECE, MECH…) and semester so you only see what is relevant to you.',
  },
  {
    icon: GraduationCap,
    title: 'AI Study Tools',
    description:
      'Summarise PDF notes, generate flashcards, and practice problems — directly from the resource card.',
  },
];

const STATS = [
  { value: '1,200+', label: 'Resources Shared' },
  { value: '340+', label: 'Active Students' },
  { value: '6', label: 'Departments' },
  { value: '4.8★', label: 'Avg. Rating' },
];

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  /** Handle "Enter Hub" or "Sign In" clicks */
  const handleEnterHub = () => {
    if (isLoggedIn) {
      router.push('/hub');
    } else {
      setAuthTab('login');
      setAuthOpen(true);
    }
  };

  const handleSignIn = () => {
    setAuthTab('login');
    setAuthOpen(true);
  };

  const handleSignUp = () => {
    setAuthTab('signup');
    setAuthOpen(true);
  };

  /** After modal success → navigate to hub */
  const handleAuthSuccess = () => {
    router.push('/hub');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans">
      {/* ------------------------------------------------------------------ */}
      {/* NAVBAR                                                              */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-6 sm:px-10 flex items-center justify-between shadow-xs">
        {/* Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm text-slate-800 tracking-tight">
              CampusHub
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              v2.0
            </span>
          </div>
        </div>

        {/* Nav actions */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/hub')}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
            >
              <span>Go to Hub</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
        {/* Eyebrow badge */}
        <span className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Open to all students · Free forever</span>
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 leading-tight max-w-2xl tracking-tight">
          Your Collaborative{' '}
          <span className="text-blue-600">Academic</span>{' '}
          Repository
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base text-slate-500 max-w-lg leading-relaxed">
          Discover, share, and upvote the best notes, past papers, and lab
          manuals for your department and semester — all in one clean,
          community-powered hub.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            id="hero-enter-hub-btn"
            onClick={handleEnterHub}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
          >
            <span>Enter Hub</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={handleSignUp}
            className="text-sm font-medium text-slate-600 hover:text-blue-600 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
          >
            Create free account
          </button>
        </div>

        {/* Social proof */}
        <p className="mt-5 text-xs text-slate-400">
          Trusted by students across 6 engineering departments
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS STRIP                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white border-y border-slate-200 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-blue-600">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURES GRID                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800">
            Everything your study group needs
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Built for engineering students, by students. No bloat, no
            subscriptions — just the resources you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  <Icon className="w-4.5 h-4.5 text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM CTA BAND                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-blue-600 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Ready to explore the hub?
        </h2>
        <p className="text-blue-100 text-sm mb-7 max-w-md mx-auto">
          Join hundreds of students sharing knowledge. Sign up in under 30
          seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleEnterHub}
            className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-sm transition text-sm"
          >
            <span>Enter Hub</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
          {!isLoggedIn && (
            <button
              onClick={handleSignUp}
              className="text-sm font-medium text-blue-100 hover:text-white px-5 py-3 rounded-xl border border-blue-400 hover:border-blue-200 transition"
            >
              Create free account
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} CampusHub · Built for students, by students.
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authTab}
      />
    </div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Eye,
  Cpu,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';

/**
 * Top navigation bar with dark editorial styling, responsive mobile slide-down menu,
 * user session state, and accessibility focus rings.
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userDropdownRef = useRef(null);
  const personaRef = useRef(null);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Sparkles },
    { href: '/detective', label: 'Skill Detective', icon: Eye },
    { href: '/match/role_distributed_systems', label: 'Blind Matching', icon: ShieldCheck },
    { href: '/roadmap/emp-101/role_distributed_systems', label: 'Career GPS', icon: Compass },
    { href: '/assistant', label: 'Career Copilot', icon: Cpu },
    { href: '/admin', label: 'HR Analytics', icon: Sparkles },
  ];

  const handleQuickSwitchPersona = async (email, role) => {
    setIsPersonaOpen(false);
    try {
      await login({
        mode: 'email',
        email,
        password: 'TalentLens2026!',
        recaptchaToken: 'recaptcha_demo_token',
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on Esc key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      ref={mobileMenuRef}
      className="sticky top-0 z-50 w-full border-b border-talent-border bg-talent-bg/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-talent-teal to-talent-purple p-0.5 shadow-glow-teal group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-talent-bg">
              <span className="font-mono text-lg font-bold text-talent-text">TL</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-talent-text">
                Talent<span className="text-talent-teal">Lens</span>
              </span>
              <span className="rounded bg-talent-card px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-talent-purple border border-talent-purple/30">
                4D Developers
              </span>
            </div>
            <p className="text-[11px] text-talent-muted">Internal Mobility & Discovery Engine</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal ${
                  isActive
                    ? 'bg-talent-card text-talent-teal border border-talent-teal/40 shadow-glow-teal'
                    : 'text-talent-subtext hover:bg-talent-card/60 hover:text-talent-text'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-talent-teal' : 'text-talent-muted'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Engine Status Pill */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-talent-border bg-talent-surface px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-talent-teal opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-talent-teal"></span>
            </span>
            <Cpu className="h-3.5 w-3.5 text-talent-teal" />
            <span className="text-talent-subtext font-mono text-[11px]">all-MiniLM-L6-v2 (Local)</span>
          </div>

          {/* Quick Persona Switcher for Hackathon Evaluation */}
          <div className="relative" ref={personaRef}>
            <button
              type="button"
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center gap-1.5 rounded-full border border-talent-teal/30 bg-talent-teal/10 px-2.5 py-1 text-xs font-mono font-semibold text-talent-teal hover:bg-talent-teal/20 transition-all"
              title="Switch demo evaluation persona"
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden lg:inline">Persona:</span>
              <span>{user?.name ? user.name.split(' ')[0] : 'Demo'}</span>
              <span className="text-[9px] text-talent-muted">▾</span>
            </button>
            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-talent-border bg-talent-card p-2 shadow-card-elevated z-50 animate-revealSlide text-left">
                <div className="px-2 py-1 text-[10px] font-mono text-talent-muted uppercase font-bold">
                  Switch Demo Persona
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickSwitchPersona('demo@talentlens.internal', 'employee')}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-talent-subtext hover:bg-talent-teal/10 hover:text-talent-teal transition-colors text-left"
                >
                  <span className="text-base">👩‍💻</span>
                  <div>
                    <div className="font-bold text-talent-text">Elena Rostova</div>
                    <div className="text-[10px] text-talent-muted">Employee (QA Lead)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitchPersona('marcus.chen@meridian.io', 'manager')}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-talent-subtext hover:bg-talent-purple/10 hover:text-talent-purple transition-colors text-left"
                >
                  <span className="text-base">👔</span>
                  <div>
                    <div className="font-bold text-talent-text">Marcus Chen</div>
                    <div className="text-[10px] text-talent-muted">Hiring Manager</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitchPersona('sarah.jenkins@meridian.io', 'hr')}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-talent-subtext hover:bg-talent-teal/10 hover:text-talent-teal transition-colors text-left"
                >
                  <span className="text-base">📊</span>
                  <div>
                    <div className="font-bold text-talent-text">Sarah Jenkins</div>
                    <div className="text-[10px] text-talent-muted">HR Director</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Sign In / Register */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                aria-expanded={isUserDropdownOpen}
                aria-label="User profile menu"
                className="flex items-center gap-2 rounded-xl border border-talent-border bg-talent-surface py-1 px-2.5 hover:border-talent-teal/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal hover-lift"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal font-mono text-xs font-bold border border-talent-teal/30">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-talent-text max-w-[110px] truncate">
                      {user.name}
                    </span>
                    {user.verified?.email && (
                      <CheckCircle2 className="h-3 w-3 text-talent-teal" title="Dual Verified" />
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-talent-muted max-w-[110px] truncate">
                    {user.role || 'Candidate'}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-talent-border bg-talent-card p-3 shadow-card-elevated z-50 animate-revealSlide">
                  <div className="border-b border-talent-border pb-2.5 mb-2">
                    <div className="text-xs font-bold text-talent-text">{user.name}</div>
                    <div className="text-[11px] text-talent-muted font-mono truncate">{user.email}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded bg-talent-card px-1.5 py-0.2 font-mono text-[9px] text-talent-purple border border-talent-purple/30 uppercase">
                        Role: {user.role || 'employee'}
                      </span>
                      {user.verified?.email && (
                        <span className="rounded bg-talent-teal/15 px-1.5 py-0.2 font-mono text-[9px] text-talent-teal border border-talent-teal/30">
                          Email Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/employee/emp-101"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-talent-subtext hover:bg-talent-surface hover:text-talent-text transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-talent-teal" />
                      <span>My Candidate Dossier</span>
                    </Link>
                    <Link
                      href="/inbox"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-talent-subtext hover:bg-talent-surface hover:text-talent-text transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-talent-purple" />
                      <span>Reveal Requests Inbox</span>
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-talent-subtext hover:bg-talent-surface hover:text-talent-text transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-talent-teal" />
                      <span>Privacy & Consent</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 font-mono text-xs font-semibold text-talent-subtext hover:text-talent-text hover:bg-talent-card/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-talent-teal/40 bg-talent-teal/15 px-3 py-1.5 font-mono text-xs font-semibold text-talent-teal hover:bg-talent-teal hover:text-talent-bg shadow-glow-teal hover-lift transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
              >
                Register
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-talent-border bg-talent-card text-talent-subtext hover:text-talent-text hover:border-talent-teal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-talent-teal" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu Panel */}
      <div
        className={`md:hidden overflow-hidden border-b border-talent-border bg-talent-bg/98 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'max-h-[500px] opacity-100 py-4 px-4'
            : 'max-h-0 opacity-0 py-0 px-4 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal ${
                  isActive
                    ? 'bg-talent-card text-talent-teal border border-talent-teal/40 shadow-glow-teal'
                    : 'text-talent-subtext hover:bg-talent-card/60 hover:text-talent-text'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-talent-teal' : 'text-talent-muted'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Mobile Auth Actions */}
          <div className="mt-3 pt-3 border-t border-talent-border flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between rounded-lg bg-talent-surface p-2.5 border border-talent-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal font-mono text-xs font-bold">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-talent-text">{user.name}</div>
                    <div className="text-[10px] text-talent-muted font-mono">{user.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-talent-border bg-talent-surface py-2 text-xs font-mono font-semibold text-talent-text text-center"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-talent-teal py-2 text-xs font-mono font-semibold text-talent-bg shadow-glow-teal text-center"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-talent-surface px-3 py-2 text-xs font-mono text-talent-subtext">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-talent-teal"></span>
              </span>
              <Cpu className="h-3.5 w-3.5 text-talent-teal" />
              <span>all-MiniLM-L6-v2 (Local Embeddings)</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

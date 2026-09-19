'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Eye, Cpu, ShieldCheck, Sparkles, Menu, X } from 'lucide-react';

/**
 * Top navigation bar with dark editorial styling, responsive mobile slide-down menu, and accessibility focus rings.
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Sparkles },
    { href: '/employee/emp-101', label: 'Hidden Skill Detective', icon: Eye },
    { href: '/roadmap/emp-101/role-dist-arch', label: 'Career GPS', icon: Compass },
    { href: '/match/role-dist-arch', label: 'Blind Matching', icon: ShieldCheck },
  ];

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Esc key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
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
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-talent-border bg-talent-surface px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-talent-teal opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-talent-teal"></span>
            </span>
            <Cpu className="h-3.5 w-3.5 text-talent-teal" />
            <span className="text-talent-subtext font-mono text-[11px]">all-MiniLM-L6-v2 (Local)</span>
          </div>

          <Link
            href="/match/role-dist-arch"
            className="hidden sm:inline-flex rounded-lg bg-gradient-to-r from-talent-teal to-talent-teal-light px-3.5 py-2 text-xs font-semibold text-talent-bg shadow-glow-teal hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal transition-all"
          >
            Launch Match Pool
          </Link>

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

      {/* Mobile Slide-Down Menu Panel with Smooth Transition */}
      <div
        className={`md:hidden overflow-hidden border-b border-talent-border bg-talent-bg/98 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'max-h-96 opacity-100 py-4 px-4'
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
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal ${
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

          <div className="mt-3 pt-3 border-t border-talent-border flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-talent-surface px-3 py-2 text-xs font-mono text-talent-subtext">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-talent-teal"></span>
              </span>
              <Cpu className="h-3.5 w-3.5 text-talent-teal" />
              <span>all-MiniLM-L6-v2 (Local Embeddings)</span>
            </div>

            <Link
              href="/match/role-dist-arch"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-talent-teal to-talent-teal-light px-4 py-2.5 text-xs font-semibold text-talent-bg shadow-glow-teal hover:opacity-95 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal transition-all"
            >
              Launch Match Pool
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Eye, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Top navigation bar with dark editorial styling and feature quick links.
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Sparkles },
    { href: '/employee/emp-101', label: 'Hidden Skill Detective', icon: Eye },
    { href: '/roadmap/emp-101/role-dist-arch', label: 'Career GPS', icon: Compass },
    { href: '/match/role-dist-arch', label: 'Blind Matching', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-talent-border bg-talent-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
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

        {/* Engine Status Pill */}
        <div className="flex items-center gap-3">
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
            className="rounded-lg bg-gradient-to-r from-talent-teal to-talent-teal-light px-4 py-2 text-xs font-semibold text-talent-bg shadow-glow-teal hover:opacity-95 transition-opacity"
          >
            Launch Match Pool
          </Link>
        </div>
      </div>
    </header>
  );
}

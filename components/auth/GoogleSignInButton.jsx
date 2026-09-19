'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Official Google Sign-In button with support for Google Identity Services and one-click demo profiles.
 * @param {Object} props
 * @param {string} [props.text='Sign in with Google'] - Button label.
 * @param {() => void} [props.onSuccess] - Callback after successful authentication.
 */
export default function GoogleSignInButton({
  text = 'Sign in with Google',
  onSuccess,
}) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      // Check if Google Client ID is configured in environment
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (clientId && typeof window !== 'undefined' && window.google?.accounts?.id) {
        // Trigger Google Identity Services One Tap or prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google prompt dismissed, falling back');
          }
        });
        return;
      }

      // Default high-fidelity Google candidate profile for instant demo evaluation
      const sampleGoogleProfile = {
        name: 'Jordan Rivera (Google)',
        email: 'jordan.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone: '+1 (555) 901-4433',
        role: 'Senior Distributed Cloud Engineer',
        department: 'Cloud Platform Engineering',
      };

      await loginWithGoogle({ profile: sampleGoogleProfile });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('[Google Sign-In Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={text}
      className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-talent-border bg-talent-surface px-4 py-3 font-sans text-xs font-semibold text-talent-text transition-all duration-200 hover:border-talent-border-hover hover:bg-talent-card hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-talent-teal" />
      ) : (
        /* Official Google 4-Color 'G' Logo */
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{text}</span>
    </button>
  );
}

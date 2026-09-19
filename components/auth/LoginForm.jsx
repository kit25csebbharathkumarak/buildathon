'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import OtpInput from './OtpInput';
import RecaptchaWidget from './RecaptchaWidget';
import GoogleSignInButton from './GoogleSignInButton';
import {
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

/**
 * LoginForm supporting Email/Password, Phone SMS OTP, Google Sign-In, and reCAPTCHA bot defense.
 */
export default function LoginForm() {
  const router = useRouter();
  const { login, resendOtp } = useAuth();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone mode states
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoSmsCode, setDemoSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // reCAPTCHA state
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Send SMS verification code
  const handleSendPhoneOtp = async (e) => {
    e?.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await resendOtp({ target: phone, type: 'phone' });
      setOtpSent(true);
      if (res.demoCode) {
        setDemoSmsCode(res.demoCode);
      }
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Could not send verification SMS.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!recaptchaToken) {
      setError('Please confirm the reCAPTCHA bot verification check.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'email') {
        await login({
          mode: 'email',
          email,
          password,
          recaptchaToken,
        });
      } else {
        if (!otpCode || otpCode.length < 6) {
          setError('Please enter the complete 6-digit SMS verification code.');
          setLoading(false);
          return;
        }
        await login({
          mode: 'phone',
          phone,
          otp: otpCode,
          recaptchaToken,
        });
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Persona Login
  const handleSelectPersona = async (personaEmail, personaRole) => {
    setMode('email');
    setEmail(personaEmail);
    setPassword('TalentLens2026!');
    setRecaptchaToken('recaptcha_demo_token');
    setError(null);
    setLoading(true);

    try {
      await login({
        mode: 'email',
        email: personaEmail,
        password: 'TalentLens2026!',
        recaptchaToken: 'recaptcha_demo_token',
      });
      if (personaRole === 'manager') {
        router.push('/match/role_distributed_systems');
      } else if (personaRole === 'hr') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* 1-Click Evaluation Persona Switcher */}
      <div className="rounded-2xl border border-talent-teal/30 bg-talent-teal/5 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-talent-teal tracking-wide uppercase font-mono">
            <Sparkles className="h-3 w-3 text-talent-teal animate-pulse" />
            <span>1-Click Evaluation Personas</span>
          </div>
          <span className="text-[10px] text-talent-muted font-mono">Instant Auth</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSelectPersona('demo@talentlens.internal', 'employee')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-talent-card border border-talent-border hover:border-talent-teal/50 hover:bg-talent-teal/10 transition-all text-center group"
          >
            <span className="text-base">👩‍💻</span>
            <span className="text-[11px] font-bold text-talent-text group-hover:text-talent-teal transition-colors">Elena</span>
            <span className="text-[9px] text-talent-muted font-mono">Employee / QA</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSelectPersona('marcus.chen@meridian.io', 'manager')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-talent-card border border-talent-border hover:border-talent-purple/50 hover:bg-talent-purple/10 transition-all text-center group"
          >
            <span className="text-base">👔</span>
            <span className="text-[11px] font-bold text-talent-text group-hover:text-talent-purple transition-colors">Marcus</span>
            <span className="text-[9px] text-talent-muted font-mono">Manager / Lead</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSelectPersona('sarah.jenkins@meridian.io', 'hr')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-talent-card border border-talent-border hover:border-talent-teal/50 hover:bg-talent-teal/10 transition-all text-center group"
          >
            <span className="text-base">📊</span>
            <span className="text-[11px] font-bold text-talent-text group-hover:text-talent-teal transition-colors">Sarah</span>
            <span className="text-[9px] text-talent-muted font-mono">HR Director</span>
          </button>
        </div>
      </div>

      {/* Tab Selector: Work Email vs Phone SMS */}
      <div className="flex rounded-xl bg-talent-surface p-1 border border-talent-border">
        <button
          type="button"
          onClick={() => {
            setMode('email');
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
            mode === 'email'
              ? 'bg-talent-card text-talent-text border border-talent-teal/30 shadow-glow-teal'
              : 'text-talent-muted hover:text-talent-text'
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Work Email</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('phone');
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
            mode === 'phone'
              ? 'bg-talent-card text-talent-text border border-talent-purple/30 shadow-glow-purple'
              : 'text-talent-muted hover:text-talent-text'
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Phone SMS</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative overflow-hidden rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8 shadow-card-elevated">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-talent-teal/10 blur-2xl" />

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-talent-text tracking-tight">
              {mode === 'email' ? 'Sign In to TalentLens' : 'Instant SMS Sign In'}
            </h2>
            <button
              type="button"
              onClick={() => handleSelectPersona('demo@talentlens.internal', 'employee')}
              className="flex items-center gap-1 rounded bg-talent-teal/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-talent-teal border border-talent-teal/20 hover:bg-talent-teal/20 transition-colors"
              title="Click to populate demo employee credentials"
            >
              <KeyRound className="h-3 w-3" />
              <span>Autofill</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-talent-muted">
            Access verified candidate telemetry, blind matching, and mobility engines.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Mode Inputs */}
          {mode === 'email' ? (
            <>
              <div>
                <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.rostova@meridian.io"
                    className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-medium text-talent-subtext">
                    Password
                  </label>
                  <span className="text-[11px] font-mono text-talent-teal cursor-pointer hover:underline">
                    Forgot code?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-10 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-talent-muted hover:text-talent-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Phone SMS Mode Inputs */
            <>
              <div>
                <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-purple"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={loading || countdown > 0}
                    className="shrink-0 rounded-xl border border-talent-purple/40 bg-talent-purple/15 px-3 py-2.5 font-mono text-xs font-semibold text-talent-purple hover:bg-talent-purple hover:text-talent-bg transition-all disabled:opacity-50"
                  >
                    {countdown > 0 ? `${countdown}s` : otpSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
              </div>

              {/* Demo Hint Banner */}
              {demoSmsCode && (
                <div className="rounded-lg border border-talent-teal/30 bg-talent-teal/10 p-2.5 text-[11px] font-mono text-talent-teal flex items-center justify-between">
                  <span>Demo SMS Code: <strong>{demoSmsCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoSmsCode)}
                    className="underline text-[10px] uppercase font-bold"
                  >
                    Autofill
                  </button>
                </div>
              )}

              {otpSent && (
                <div className="pt-2">
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-2 text-center">
                    Enter 6-Digit SMS Code
                  </label>
                  <OtpInput
                    value={otpCode}
                    onChange={setOtpCode}
                    disabled={loading}
                    isError={Boolean(error)}
                  />
                </div>
              )}
            </>
          )}

          {/* reCAPTCHA Checkpoint */}
          <div className="pt-2">
            <RecaptchaWidget
              onVerify={(token) => setRecaptchaToken(token)}
              isVerified={Boolean(recaptchaToken)}
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading || (mode === 'phone' && !otpSent)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-talent-teal py-3 text-xs font-bold font-mono text-talent-bg shadow-glow-teal hover:bg-talent-teal-light transition-all hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <span>{loading ? 'Authenticating...' : 'Authorize & Enter Platform'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-talent-border" />
          </div>
          <span className="relative bg-talent-card px-3 font-mono text-[10px] uppercase tracking-wider text-talent-muted">
            Or Authenticate With
          </span>
        </div>

        {/* Google Sign-In Action */}
        <GoogleSignInButton
          text="Sign in with Google Workspace"
          onSuccess={() => {
            router.push('/');
            router.refresh();
          }}
        />

        {/* Footer Navigation Link */}
        <div className="mt-6 text-center text-xs text-talent-muted">
          <span>New candidate or organization? </span>
          <Link
            href="/register"
            className="font-semibold text-talent-teal hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-talent-teal rounded"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

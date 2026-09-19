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
  User,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';

/**
 * RegisterForm supporting multi-step registration with mandatory dual OTP verification (Email + Phone),
 * reCAPTCHA bot defense, and Google Sign-Up.
 */
export default function RegisterForm() {
  const router = useRouter();
  const { register, verifyOtp, resendOtp } = useAuth();

  // Multi-step: 1 = Details, 2 = Dual Verification, 3 = Final Security Check
  const [step, setStep] = useState(1);

  // Step 1: Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Senior Systems Architect');
  const [department, setDepartment] = useState('Core Engineering Infrastructure');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Verification States
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [demoEmailCode, setDemoEmailCode] = useState('');
  const [demoPhoneCode, setDemoPhoneCode] = useState('');

  // Step 3: reCAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 -> Step 2: Initiate Dual Verification
  const handleInitiateVerification = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all candidate profile fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Initiate verification on backend: issues dual OTPs
      const res = await register({
        name,
        email,
        phone,
        password,
        role,
        department,
        action: 'initiate',
      });

      if (res.demoOtps) {
        setDemoEmailCode(res.demoOtps.emailCode);
        setDemoPhoneCode(res.demoOtps.phoneCode);
      }

      setStep(2);
      startCountdowns();
    } catch (err) {
      setError(err.message || 'Could not initiate verification.');
    } finally {
      setLoading(false);
    }
  };

  const startCountdowns = () => {
    setEmailTimer(60);
    setPhoneTimer(60);

    const timer = setInterval(() => {
      setEmailTimer((t) => (t > 0 ? t - 1 : 0));
      setPhoneTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
  };

  // Verify Email OTP
  const handleVerifyEmail = async () => {
    if (!emailOtp || emailOtp.length < 4) {
      setError('Please enter the 6-digit email verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await verifyOtp({ target: email, type: 'email', code: emailOtp });
      setEmailVerified(true);
    } catch (err) {
      setError(err.message || 'Email verification code invalid.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyPhone = async () => {
    if (!phoneOtp || phoneOtp.length < 4) {
      setError('Please enter the 6-digit SMS verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await verifyOtp({ target: phone, type: 'phone', code: phoneOtp });
      setPhoneVerified(true);
    } catch (err) {
      setError(err.message || 'Phone verification code invalid.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendEmail = async () => {
    try {
      const res = await resendOtp({ target: email, type: 'email' });
      if (res.demoCode) setDemoEmailCode(res.demoCode);
      setEmailTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to resend email code.');
    }
  };

  // Resend Phone OTP
  const handleResendPhone = async () => {
    try {
      const res = await resendOtp({ target: phone, type: 'phone' });
      if (res.demoCode) setDemoPhoneCode(res.demoCode);
      setPhoneTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to resend phone SMS.');
    }
  };

  // Step 2 -> Step 3: Proceed to Security Check
  const handleProceedToSecurity = () => {
    if (!emailVerified || !phoneVerified) {
      setError('Both Work Email and Phone Number must be verified to continue.');
      return;
    }
    setError(null);
    setStep(3);
  };

  // Step 3: Finalize Account Creation
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA bot defense checkpoint.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        department,
        action: 'complete',
        emailVerified: true,
        phoneVerified: true,
        recaptchaToken,
      });

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between rounded-xl bg-talent-surface p-3 border border-talent-border">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
              step >= 1
                ? 'bg-talent-teal text-talent-bg shadow-glow-teal'
                : 'bg-talent-card text-talent-muted'
            }`}
          >
            {step > 1 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : '1'}
          </span>
          <span className={`text-xs font-mono font-semibold ${step === 1 ? 'text-talent-text' : 'text-talent-muted'}`}>
            Profile
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-2 sm:mx-4 ${step >= 2 ? 'bg-talent-teal' : 'bg-talent-border'}`} />

        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
              step >= 2
                ? 'bg-talent-teal text-talent-bg shadow-glow-teal'
                : 'bg-talent-card text-talent-muted'
            }`}
          >
            {step > 2 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : '2'}
          </span>
          <span className={`text-xs font-mono font-semibold ${step === 2 ? 'text-talent-text' : 'text-talent-muted'}`}>
            Dual Verification
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-2 sm:mx-4 ${step >= 3 ? 'bg-talent-teal' : 'bg-talent-border'}`} />

        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
              step === 3
                ? 'bg-talent-teal text-talent-bg shadow-glow-teal'
                : 'bg-talent-card text-talent-muted'
            }`}
          >
            3
          </span>
          <span className={`text-xs font-mono font-semibold ${step === 3 ? 'text-talent-text' : 'text-talent-muted'}`}>
            Security Check
          </span>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="relative overflow-hidden rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8 shadow-card-elevated">
        <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-talent-purple/10 blur-2xl" />

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* ================= STEP 1: Profile Information ================= */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-black text-talent-text tracking-tight">
                Create Candidate & Platform Account
              </h2>
              <p className="mt-1 text-xs text-talent-muted">
                Join TalentLens to discover your latent engineering competencies through AI telemetry extraction.
              </p>
            </div>

            <form onSubmit={handleInitiateVerification} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                  />
                </div>
              </div>

              {/* Work Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                    Work Email (Domain Verified)
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@meridian.io"
                      className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                    Mobile Phone (SMS OTP)
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 432-8899"
                      className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Department Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                    Current Engineering Role
                  </label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Senior Cloud Architect"
                      className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Core Systems Infrastructure"
                    className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 px-3.5 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                    Password (8+ chars)
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-talent-subtext mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-talent-muted" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-talent-border bg-talent-surface py-2.5 pl-10 pr-4 text-xs font-sans text-talent-text placeholder:text-talent-muted/60 transition-colors hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Proceed to Dual Verification */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-talent-teal py-3 text-xs font-bold font-mono text-talent-bg shadow-glow-teal hover:bg-talent-teal-light transition-all hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal uppercase tracking-wider disabled:opacity-50"
              >
                <span>{loading ? 'Dispatching Verification Codes...' : 'Continue to Dual Verification'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Google Fast Track */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-talent-border" />
              </div>
              <span className="relative bg-talent-card px-3 font-mono text-[10px] uppercase tracking-wider text-talent-muted">
                Or Fast-Track Onboarding With
              </span>
            </div>

            <GoogleSignInButton
              text="Sign up with Google Workspace"
              onSuccess={() => {
                router.push('/');
                router.refresh();
              }}
            />
          </div>
        )}

        {/* ================= STEP 2: Dual Verification (Email + Phone) ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-talent-purple/15 px-2 py-0.5 text-[10px] font-mono font-bold text-talent-purple border border-talent-purple/30 uppercase">
                  Step 2 of 3
                </span>
                <h2 className="text-xl font-black text-talent-text tracking-tight">
                  Dual Identity Verification
                </h2>
              </div>
              <p className="mt-1 text-xs text-talent-muted">
                To guarantee zero demographic bias and protect internal candidate telemetry, TalentLens requires two-factor verification.
              </p>
            </div>

            {/* Email OTP Verification Section */}
            <div className={`rounded-xl border p-4 sm:p-5 transition-colors ${
              emailVerified ? 'border-talent-teal/70 bg-talent-teal/5 shadow-glow-teal' : 'border-talent-border bg-talent-surface/70'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-talent-teal" />
                  <div>
                    <h3 className="font-mono text-xs font-bold text-talent-text">Work Email Verification</h3>
                    <p className="text-[11px] text-talent-muted">{email}</p>
                  </div>
                </div>

                {emailVerified ? (
                  <span className="flex items-center gap-1 rounded-full bg-talent-teal/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-talent-teal border border-talent-teal/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>VERIFIED</span>
                  </span>
                ) : (
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                    Pending OTP
                  </span>
                )}
              </div>

              {!emailVerified ? (
                <div className="space-y-3">
                  {demoEmailCode && (
                    <div className="rounded border border-talent-teal/30 bg-talent-teal/10 p-2 text-[11px] font-mono text-talent-teal flex items-center justify-between">
                      <span>Demo Email Code: <strong>{demoEmailCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setEmailOtp(demoEmailCode)}
                        className="underline text-[10px] uppercase font-bold"
                      >
                        Autofill
                      </button>
                    </div>
                  )}

                  <OtpInput value={emailOtp} onChange={setEmailOtp} isError={Boolean(error)} />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={emailTimer > 0}
                      className="text-[11px] font-mono text-talent-muted hover:text-talent-teal disabled:opacity-40"
                    >
                      {emailTimer > 0 ? `Resend email code in ${emailTimer}s` : 'Resend Email Code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={loading || emailOtp.length < 4}
                      className="rounded-lg bg-talent-teal px-3 py-1.5 font-mono text-xs font-bold text-talent-bg shadow-glow-teal hover:bg-talent-teal-light disabled:opacity-40"
                    >
                      Verify Email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-talent-teal flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>Email domain confirmed. Token registered to candidate record.</span>
                </div>
              )}
            </div>

            {/* Phone SMS OTP Verification Section */}
            <div className={`rounded-xl border p-4 sm:p-5 transition-colors ${
              phoneVerified ? 'border-talent-purple/70 bg-talent-purple/5 shadow-glow-purple' : 'border-talent-border bg-talent-surface/70'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-talent-purple" />
                  <div>
                    <h3 className="font-mono text-xs font-bold text-talent-text">Mobile Phone SMS Verification</h3>
                    <p className="text-[11px] text-talent-muted">{phone}</p>
                  </div>
                </div>

                {phoneVerified ? (
                  <span className="flex items-center gap-1 rounded-full bg-talent-purple/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-talent-purple border border-talent-purple/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>VERIFIED</span>
                  </span>
                ) : (
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                    Pending SMS
                  </span>
                )}
              </div>

              {!phoneVerified ? (
                <div className="space-y-3">
                  {demoPhoneCode && (
                    <div className="rounded border border-talent-purple/30 bg-talent-purple/10 p-2 text-[11px] font-mono text-talent-purple flex items-center justify-between">
                      <span>Demo SMS Code: <strong>{demoPhoneCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setPhoneOtp(demoPhoneCode)}
                        className="underline text-[10px] uppercase font-bold"
                      >
                        Autofill
                      </button>
                    </div>
                  )}

                  <OtpInput value={phoneOtp} onChange={setPhoneOtp} isError={Boolean(error)} />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleResendPhone}
                      disabled={phoneTimer > 0}
                      className="text-[11px] font-mono text-talent-muted hover:text-talent-purple disabled:opacity-40"
                    >
                      {phoneTimer > 0 ? `Resend SMS in ${phoneTimer}s` : 'Resend SMS Code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={loading || phoneOtp.length < 4}
                      className="rounded-lg bg-talent-purple px-3 py-1.5 font-mono text-xs font-bold text-talent-bg shadow-glow-purple hover:opacity-90 disabled:opacity-40"
                    >
                      Verify Phone
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-talent-purple flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>SMS OTP confirmed. Phone bound for confidential alerts.</span>
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 rounded-xl border border-talent-border bg-talent-surface px-4 py-2.5 text-xs font-mono text-talent-muted hover:text-talent-text transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Profile</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToSecurity}
                disabled={!emailVerified || !phoneVerified}
                className="flex items-center gap-2 rounded-xl bg-talent-teal px-5 py-2.5 text-xs font-mono font-bold text-talent-bg shadow-glow-teal hover:bg-talent-teal-light disabled:opacity-40 transition-all uppercase tracking-wider"
              >
                <span>Proceed to Security Check</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: reCAPTCHA & Finalize ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-talent-teal/15 px-2 py-0.5 text-[10px] font-mono font-bold text-talent-teal border border-talent-teal/30 uppercase">
                  Final Step
                </span>
                <h2 className="text-xl font-black text-talent-text tracking-tight">
                  Bot Defense & Privacy Shield
                </h2>
              </div>
              <p className="mt-1 text-xs text-talent-muted">
                Zero demographic bias audit verification. Confirm reCAPTCHA checkpoint before initializing your candidate profile.
              </p>
            </div>

            {/* Verification Summary Card */}
            <div className="rounded-xl border border-talent-border bg-talent-surface/80 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-talent-subtext">
                <span>Candidate:</span>
                <strong className="text-talent-text">{name}</strong>
              </div>
              <div className="flex justify-between items-center text-talent-subtext">
                <span>Work Email:</span>
                <span className="text-talent-teal font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {email}
                </span>
              </div>
              <div className="flex justify-between items-center text-talent-subtext">
                <span>Phone SMS:</span>
                <span className="text-talent-purple font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {phone}
                </span>
              </div>
              <div className="flex justify-between items-center text-talent-subtext">
                <span>Target Role Mandate:</span>
                <span className="text-talent-text">{role}</span>
              </div>
            </div>

            {/* reCAPTCHA Widget */}
            <RecaptchaWidget
              onVerify={(token) => setRecaptchaToken(token)}
              isVerified={Boolean(recaptchaToken)}
            />

            {/* Final Submission Button */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 rounded-xl border border-talent-border bg-talent-surface px-4 py-2.5 text-xs font-mono text-talent-muted hover:text-talent-text transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || !recaptchaToken}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-talent-teal py-3 text-xs font-bold font-mono text-talent-bg shadow-glow-teal hover:bg-talent-teal-light transition-all hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal uppercase tracking-wider disabled:opacity-40"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{loading ? 'Finalizing Profile...' : 'Complete Registration'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Link */}
        <div className="mt-6 text-center text-xs text-talent-muted">
          <span>Already have a candidate or reviewer account? </span>
          <Link
            href="/login"
            className="font-semibold text-talent-teal hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-talent-teal rounded"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

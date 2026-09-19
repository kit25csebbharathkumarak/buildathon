import Link from 'next/link';
import LoginForm from '../../components/auth/LoginForm';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Sign In — TalentLens Platform',
  description: 'Sign in with Work Email, Phone SMS OTP, or Google Workspace to access verified candidate telemetry.',
};

/**
 * Dedicated Sign In page supporting Work Email, Phone SMS OTP, Google Sign-In, and reCAPTCHA.
 */
export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center py-6 sm:py-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-talent-teal/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-talent-purple/10 blur-[100px]" />

      {/* Top back link */}
      <div className="mb-6 w-full max-w-md mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-talent-muted hover:text-talent-teal transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Talent Directory</span>
        </Link>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-talent-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-talent-teal" />
          <span>Zero-Bias Audited</span>
        </div>
      </div>

      {/* Login Form Component */}
      <LoginForm />
    </div>
  );
}

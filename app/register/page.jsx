import Link from 'next/link';
import RegisterForm from '../../components/auth/RegisterForm';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Candidate Registration & Dual Verification — TalentLens',
  description: 'Register and verify candidate profile with work email OTP, phone SMS OTP, and reCAPTCHA bot defense.',
};

/**
 * Dedicated Registration page supporting Dual OTP Verification (Email + Phone), reCAPTCHA, and Google Sign-Up.
 */
export default function RegisterPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center py-6 sm:py-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-talent-purple/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/3 h-80 w-80 rounded-full bg-talent-teal/10 blur-[100px]" />

      {/* Top back link */}
      <div className="mb-6 w-full max-w-xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-talent-muted hover:text-talent-teal transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Talent Directory</span>
        </Link>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-talent-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-talent-purple" />
          <span>Encrypted Telemetry Storage</span>
        </div>
      </div>

      {/* Register Form Component */}
      <RegisterForm />
    </div>
  );
}

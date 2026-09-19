import { NextResponse } from 'next/server';
import { verifyOtp, createOtp } from '../../../../lib/auth-store';

/**
 * Validates 6-digit OTP code or re-dispatches new code for email or phone.
 * POST /api/auth/verify-otp
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { target, type, code, action = 'verify' } = body;

    if (!target || !type) {
      return NextResponse.json(
        { error: 'Target destination and verification channel type are required.' },
        { status: 400 }
      );
    }

    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        { error: 'Channel type must be either "email" or "phone".' },
        { status: 400 }
      );
    }

    // Handle resend request
    if (action === 'resend') {
      const newOtp = createOtp(target, type);
      console.log(`[TalentLens Auth] Re-issued OTP for ${target} (${type}): ${newOtp.code}`);

      return NextResponse.json({
        success: true,
        message: `A new 6-digit code has been sent to your ${type === 'email' ? 'work email' : 'phone number'}.`,
        demoCode: newOtp.code,
        expiresIn: 600,
      });
    }

    // Handle verification check
    if (!code || String(code).trim().length < 4) {
      return NextResponse.json(
        { error: 'Please enter a valid verification code.' },
        { status: 400 }
      );
    }

    const result = verifyOtp(target, type, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      type,
      target,
      message: `${type === 'email' ? 'Work email' : 'Phone number'} verified successfully!`,
    });
  } catch (err) {
    console.error('[Verify OTP Error]:', err);
    return NextResponse.json(
      { error: 'Internal error validating verification code.' },
      { status: 500 }
    );
  }
}

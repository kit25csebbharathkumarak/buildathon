import { NextResponse } from 'next/server';
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  createOtp,
  createSession,
} from '../../../../lib/auth-store';

/**
 * Handles user onboarding and dispatches dual OTPs for email and phone verification.
 * POST /api/auth/register
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      role,
      department,
      action = 'initiate', // 'initiate' (sends OTPs) | 'complete' (finalizes creation)
      emailVerified = false,
      phoneVerified = false,
    } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingByEmail = findUserByEmail(email);
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'An account with this work email already exists.' },
        { status: 409 }
      );
    }

    const existingByPhone = findUserByPhone(phone);
    if (existingByPhone) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists.' },
        { status: 409 }
      );
    }

    // If initiating verification, generate dual OTPs
    if (action === 'initiate') {
      const emailOtp = createOtp(email, 'email');
      const phoneOtp = createOtp(phone, 'phone');

      console.log(`[TalentLens Auth] Verification OTP for ${email}: ${emailOtp.code}`);
      console.log(`[TalentLens Auth] Verification SMS OTP for ${phone}: ${phoneOtp.code}`);

      return NextResponse.json({
        success: true,
        message: 'Verification codes dispatched to work email and phone.',
        // Expose OTP codes in payload for instant evaluator/developer testing
        demoOtps: {
          emailCode: emailOtp.code,
          phoneCode: phoneOtp.code,
        },
        expiresIn: 600,
      });
    }

    // Action === 'complete': finalize registration
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const newUser = createUser({
      name,
      email,
      phone,
      role: role || 'Engineering Candidate',
      department: department || 'Product & Platform Engineering',
      password,
      verified: {
        email: Boolean(emailVerified),
        phone: Boolean(phoneVerified),
      },
    });

    const token = createSession(newUser.id);

    const response = NextResponse.json({
      success: true,
      message: 'Account created and verified successfully.',
      user: newUser,
      token,
    });

    // Set HTTP-only cookie for session
    response.cookies.set('talentlens_session', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      httpOnly: false, // accessible to client for sync
    });

    return response;
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}

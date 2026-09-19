import { NextResponse } from 'next/server';
import {
  findUserByEmail,
  findUserByPhone,
  verifyPassword,
  verifyOtp,
  createSession,
  validateSession,
  sanitizeUser,
} from '../../../../lib/auth-store';

/**
 * Handles user authentication via Email/Password, Phone SMS OTP, or Session validation.
 * POST /api/auth/login
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { mode = 'email', email, phone, password, otp, token, recaptchaToken } = body;

    // 1. Session Token Validation Mode (for auto-login / hydration)
    if (mode === 'session') {
      if (!token) {
        return NextResponse.json(
          { error: 'Session token required.' },
          { status: 400 }
        );
      }

      const user = validateSession(token);
      if (!user) {
        return NextResponse.json(
          { error: 'Session has expired or is invalid.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user,
        token,
      });
    }

    // Optional reCAPTCHA score check (validates token if secret key is present)
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      try {
        const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(recaptchaToken)}`,
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          return NextResponse.json(
            { error: 'reCAPTCHA bot verification failed. Please try again.' },
            { status: 403 }
          );
        }
      } catch (captchaErr) {
        console.warn('[reCAPTCHA Warning]: Verification call bypassed or failed:', captchaErr.message);
      }
    }

    let user = null;

    // 2. Email & Password Mode
    if (mode === 'email') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Work email and password are required.' },
          { status: 400 }
        );
      }

      user = findUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this work email.' },
          { status: 404 }
        );
      }

      const isValid = verifyPassword(user, password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid password. Please check and try again.' },
          { status: 401 }
        );
      }
    }

    // 3. Phone & SMS OTP Mode
    else if (mode === 'phone') {
      if (!phone || !otp) {
        return NextResponse.json(
          { error: 'Phone number and SMS verification code are required.' },
          { status: 400 }
        );
      }

      user = findUserByPhone(phone);
      if (!user) {
        return NextResponse.json(
          { error: 'No candidate profile found with this phone number. Please register first.' },
          { status: 404 }
        );
      }

      const otpResult = verifyOtp(phone, 'phone', otp);
      if (!otpResult.success) {
        return NextResponse.json(
          { error: otpResult.message || 'Invalid SMS verification code.' },
          { status: 401 }
        );
      }
    }

    else {
      return NextResponse.json(
        { error: 'Unsupported authentication mode.' },
        { status: 400 }
      );
    }

    const sessionToken = createSession(user.id);
    const safeUser = sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully.',
      user: safeUser,
      token: sessionToken,
    });

    response.cookies.set('talentlens_session', sessionToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (err) {
    console.error('[Login API Error]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in.' },
      { status: 500 }
    );
  }
}

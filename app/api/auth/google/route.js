import { NextResponse } from 'next/server';
import {
  findUserByEmail,
  createUser,
  createSession,
  sanitizeUser,
} from '../../../../lib/auth-store';

/**
 * Handles Sign In with Google via OAuth token verification or profile payload.
 * POST /api/auth/google
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { credential, profile } = body;

    let googleUser = null;

    // If real Google credential (JWT ID token) is passed
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
            credential
          )}`
        );
        const tokenInfo = await verifyRes.json();
        if (tokenInfo.email) {
          googleUser = {
            name: tokenInfo.name || tokenInfo.email.split('@')[0],
            email: tokenInfo.email,
            avatar: tokenInfo.picture || null,
          };
        }
      } catch (tokenErr) {
        console.warn('[Google Tokeninfo Warning]: Could not verify token with Google API:', tokenErr.message);
      }
    }

    // If profile payload provided (e.g. from Google SDK callback or demo profile)
    if (!googleUser && profile && profile.email) {
      googleUser = {
        name: profile.name || 'Google Candidate',
        email: profile.email,
        avatar: profile.avatar || profile.picture || null,
        phone: profile.phone || '+1 (555) 000-0000',
        role: profile.role || 'Verified Candidate',
        department: profile.department || 'Engineering',
      };
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { error: 'Valid Google account credentials or profile required.' },
        { status: 400 }
      );
    }

    // Match or create candidate account
    let user = findUserByEmail(googleUser.email);
    if (!user) {
      user = createUser({
        name: googleUser.name,
        email: googleUser.email,
        phone: googleUser.phone || '+1 (555) 000-0000',
        role: googleUser.role || 'Verified Candidate',
        department: googleUser.department || 'Engineering Mobility',
        password: `GoogleAuth_${Math.random().toString(36)}`,
        avatar: googleUser.avatar,
        verified: {
          email: true,
          phone: false,
        },
      });
    }

    const sessionToken = createSession(user.id);
    const safeUser = sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: 'Signed in with Google successfully.',
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
    console.error('[Google Auth Error]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during Google sign in.' },
      { status: 500 }
    );
  }
}

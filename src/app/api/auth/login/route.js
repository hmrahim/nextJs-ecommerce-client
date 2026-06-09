import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/token';
import { authService } from '@/services/authService';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // তোমার backend-এ login call
    const data = await authService.login({ email, password });

    // JWT বানাও এবং httpOnly cookie-তে রাখো
    const token = await createToken({
      id: data.user._id,
      email: data.user.email,
      role: data.user.role,
    });

    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 দিন
      path: '/',
    });

    return NextResponse.json({ user: data.user });

  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Login failed' },
      { status: 401 }
    );
  }
}
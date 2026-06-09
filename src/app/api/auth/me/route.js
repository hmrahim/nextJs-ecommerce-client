import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/token';
import { authService } from '@/services/authService';

export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json(null, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json(null, { status: 401 });

    // backend থেকে fresh user data আনো
    const data = await authService.getMe(token);
    if (!data) return NextResponse.json(null, { status: 401 });

    return NextResponse.json({ user: data.user });

  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
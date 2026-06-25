// 📁 PATH: src/hooks/useRequireEmailVerified.js
// ✅ Checkout page এ এই hook use করলে
//    unverified user কে verify page এ পাঠিয়ে দেবে
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

/**
 * Use in any page that requires email verification.
 * Redirects to /auth/verify-email if the user's email is not verified.
 *
 * @example
 * // checkout/page.jsx এ
 * useRequireEmailVerified();
 */
export function useRequireEmailVerified() {
  const router           = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    /* not logged in → login page */
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
      return;
    }

    /* logged in but email not verified → verify page */
    if (session?.user && !session.user.emailVerified) {
      toast.error('Please verify your email before checkout.');
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(session.user.email)}`
      );
    }
  }, [status, session, router]);

  const isVerified =
    status === 'authenticated' && !!session?.user?.emailVerified;

  return { isVerified, loading: status === 'loading' };
}
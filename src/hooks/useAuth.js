// 📁 PATH: src/hooks/useAuth.js
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const loading = status === 'loading';
  const isLoggedIn = status === 'authenticated';

  // session.user থেকে সব field বের করা — session না বদলালে recalculate হবে না
  const user = useMemo(() => {
    if (!session?.user) return null;

    const u = session.user;
    return {
      id: u.id ?? null,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      email: u.email ?? '',
      role: u.role ?? 'buyer',
      token: u.token ?? null,
      image: u.image ?? null,
    };
  }, [session]);


  // Role helpers
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  const isBuyer = user?.role === 'buyer';

  /**
   * একাধিক role একসাথে চেক করো
   * Example: hasRole('admin', 'seller')
   */
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Email/password দিয়ে login
   */
  const loginWithCredentials = async ({ email, password }) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error || 'Login failed');
    }

    return result;
  };

  /**
   * Logout করে login page এ redirect করে
   */
  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
    router.refresh();
  };

  /**
   * Protected page এ use করো।
   * Login না থাকলে redirect করবে।
   * Example: useEffect(() => { requireAuth() }, [])
   */
  const requireAuth = (redirectTo = '/auth/login') => {
    if (!loading && !isLoggedIn) {
      router.push(redirectTo);
    }
  };

  return {
    // User object
    user,           // { id, firstName, lastName, fullName, email, role, token }

    // Status
    loading,
    isLoggedIn,
    status,

    // Role checks
    isAdmin,
    isSeller,
    isBuyer,
    hasRole,

    // Actions
    loginWithCredentials,
    logout,
    requireAuth,
  };
}
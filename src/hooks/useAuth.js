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

  // session.user all from field to extract — session if not changed recalculate will not be
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
   * multiple role Check together
   * Example: hasRole('admin', 'seller')
   */
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Email/password by login
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
   * Logout Do login page In redirect Do
   */
  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
    router.refresh();
  };

  /**
   * Protected page In use Do।
   * Login If not available redirect will do।
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
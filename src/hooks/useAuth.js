'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user ?? null;
  const loading = status === 'loading';
  const isLoggedIn = status === 'authenticated';

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

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
    router.refresh();
  };

  return {
    user,
    loading,
    isLoggedIn,
    loginWithCredentials,
    logout,
  };
}
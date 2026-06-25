// 📁 PATH: src/app/api/auth/[...nextauth]/route.js
// ✅ CHANGE: authorize() এ 403 (requiresVerification) হলে
//           email টা error message এ encode করে পাঠায়
//           যাতে login page redirect করতে পারে
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/signin`,
            { email: credentials.email, password: credentials.password },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { token, user } = res.data;
          if (!user) throw new Error('No user returned');

          return {
            id:            user.id || user._id,
            firstName:     user.firstName,
            lastName:      user.lastName,
            email:         user.email,
            role:          user.role,
            token:         token,
            emailVerified: user.emailVerified ?? false, // ✅ যোগ
          };
        } catch (err) {
          const data = err?.response?.data;

          // ✅ Email verified না হলে special error format পাঠাও
          // Login page এই format দেখে redirect করবে
          if (data?.requiresVerification) {
            throw new Error(`VERIFY_EMAIL:${data.email || credentials.email}`);
          }

          throw new Error(data?.message || 'Invalid credentials');
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id            = user.id;
        token.firstName     = user.firstName;
        token.lastName      = user.lastName;
        token.email         = user.email;
        token.role          = user.role;
        token.token         = user.token;
        token.emailVerified = user.emailVerified; // ✅ যোগ
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id            = token.id;
      session.user.firstName     = token.firstName;
      session.user.lastName      = token.lastName;
      session.user.role          = token.role;
      session.user.token         = token.token;
      session.user.emailVerified = token.emailVerified; // ✅ যোগ
      return session;
    },
  },

  pages:   { signIn: '/auth/login' },
  session: { strategy: 'jwt' },
  secret:  process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// 📁 PATH: src/app/auth/forgot-password/page.jsx
// User email দিলে backend reset OTP পাঠায়, তারপর /auth/reset-password?email=... এ যায়
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const router     = useRouter();
  const [sent, setSent]         = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/forgot-password', { email: data.email });
      setSentEmail(data.email);
      setSent(true);
      toast.success('Reset code sent! Check your email.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Try again.';
      if (err?.response?.status === 429) {
        toast.error('Please wait 1 minute before requesting again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToReset = () => {
    router.push(`/auth/reset-password?email=${encodeURIComponent(sentEmail)}`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-indigo-600 blur-[130px] opacity-40" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-600 blur-[130px] opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.07)]">

          {!sent ? (
            <>
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
                  <Mail className="h-9 w-9 text-white" />
                </div>
              </div>

              <h1 className="mb-2 text-center text-3xl font-bold text-white">Forgot Password?</h1>
              <p className="mb-8 text-center text-gray-400 text-sm leading-relaxed">
                No worries! Enter your email and we&apos;ll send you a 6-digit reset code.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Your email address"
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-indigo-500 placeholder:text-gray-500"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reset Code
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* ── Success state ── */
            <>
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30">
                  <CheckCircle className="h-9 w-9 text-white" />
                </div>
              </div>

              <h1 className="mb-2 text-center text-3xl font-bold text-white">Check Your Email</h1>
              <p className="mb-2 text-center text-gray-400 text-sm">Reset code sent to</p>
              <p className="mb-8 text-center font-semibold text-indigo-400 text-sm break-all">
                {sentEmail}
              </p>

              <motion.button
                onClick={goToReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition"
              >
                Enter Reset Code →
              </motion.button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-gray-500 hover:text-gray-300 transition"
                >
                  Use a different email
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
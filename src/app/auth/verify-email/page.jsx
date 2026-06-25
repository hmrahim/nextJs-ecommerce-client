// 📁 PATH: src/app/auth/verify-email/page.jsx
// ✅ Signup এর পরে এই page এ redirect হবে।
// OTP enter করলে verified হয়ে login হয়ে যাবে।
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') || '';

  /* 6-digit OTP inputs */
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [resendTimer, setTimer]  = useState(0); // seconds remaining
  const inputRefs                = useRef([]);
  const timerRef                 = useRef(null);

  /* ── start 60-second resend cooldown ───────────────────────── */
  const startTimer = () => {
    setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  if (!email) {
    router.replace('/auth/register');
    return null;
  }

  /* ── OTP input handlers ─────────────────────────────────────── */
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // শুধু digit
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpValue = otp.join('');

  /* ── Verify mutation ─────────────────────────────────────────── */
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/verify-email', { email, otp: otpValue });
      return res.data;
    },
    onSuccess: async (data) => {
      toast.success('Email verified! Logging you in…');

      /* NextAuth session এ token রাখতে signIn করো */
      /* তোমার NextAuth route যেভাবে token রাখে সেটা depend করে */
      /* এখানে token localStorage এ রাখছি fallback হিসেবে */
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user',  JSON.stringify(data.user));
      }

      router.push('/');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Verification failed';
      toast.error(msg);
      /* expired হলে OTP clear */
      if (err?.response?.data?.expired) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    },
  });

  /* ── Resend OTP mutation ─────────────────────────────────────── */
  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/resend-otp', { email });
      return res.data;
    },
    onSuccess: () => {
      toast.success('A new OTP has been sent to your email!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startTimer();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    },
  });

  const handleVerify = () => {
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    verifyMutation.mutate();
  };

  /* ─────────────────────────────────────────────────────────────
     UI
  ───────────────────────────────────────────────────────────── */
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

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full
                            bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Mail className="h-9 w-9 text-white" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold text-white">
            Verify Your Email
          </h1>
          <p className="mb-2 text-center text-gray-400 text-sm">
            We've sent a 6-digit code to
          </p>
          <p className="mb-8 text-center font-semibold text-indigo-400 text-sm break-all">
            {email}
          </p>

          {/* OTP Inputs */}
          <div className="mb-6 flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`h-14 w-12 rounded-xl border text-center text-2xl font-bold
                            text-white outline-none transition-all duration-200
                            bg-white/5 caret-indigo-400
                            ${digit
                              ? 'border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/30'
                              : 'border-white/10 focus:border-indigo-500'
                            }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            disabled={verifyMutation.isPending || otpValue.length !== 6}
            className="mb-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                       py-4 font-semibold text-white shadow-lg transition disabled:opacity-50"
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Verifying…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verify Email
              </span>
            )}
          </motion.button>

          {/* Resend OTP */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in{' '}
                <span className="font-semibold text-indigo-400">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition
                           disabled:opacity-50 flex items-center gap-1 mx-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
                {resendMutation.isPending ? 'Sending…' : "Didn't receive it? Resend OTP"}
              </button>
            )}
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

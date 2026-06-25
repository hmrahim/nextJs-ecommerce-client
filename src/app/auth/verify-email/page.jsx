// 📁 PATH: src/app/auth/verify-email/page.jsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

function VerifyEmailContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') || '';

  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [resendTimer, setTimer]      = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const timerRef  = useRef(null);

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
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!email) window.location.href = '/auth/register';
  }, [email]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
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

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      // Step 1: OTP verify করো, backend থেকে verified user পাও
      const res = await api.post('/verify-email', { email, otp: otpValue });
      const { user } = res.data;

      toast.success('Email verified! Logging you in…');

      // Step 2: ✅ NextAuth দিয়ে login করো — এতে proper session তৈরি হবে
      // Backend এ password নেই তাই একটু কৌশল: verify হওয়া মানেই authenticated
      // NextAuth credentials provider দিয়ে login করতে password লাগবে
      // তাই backend এ একটা temp-token বা verified session approach দরকার
      //
      // সবচেয়ে simple solution: signIn কে একটা special "verified" flag দিয়ে call করো
      // আর NextAuth route এ সেই case handle করো
      const result = await signIn('credentials', {
        email,
        verified: 'true',   // ← special flag, password skip করবে
        redirect: false,
      });

      if (result?.error) {
        // fallback: user কে login page এ পাঠাও
        toast('Please login to continue', { icon: '🔐' });
        router.push(`/auth/login?email=${encodeURIComponent(email)}`);
        return;
      }

      router.push('/');
      router.refresh();

    } catch (err) {
      const errData = err?.response?.data;
      toast.error(errData?.message || 'Verification failed. Try again.');
      if (errData?.expired) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await api.post('/resend-otp', { email });
      toast.success('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startTimer();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.07)]">

      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Mail className="h-9 w-9 text-white" />
        </div>
      </div>

      <h1 className="mb-2 text-center text-3xl font-bold text-white">Verify Your Email</h1>
      <p className="mb-1 text-center text-gray-400 text-sm">We've sent a 6-digit code to</p>
      <p className="mb-8 text-center font-semibold text-indigo-400 text-sm break-all">{email}</p>

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
                        text-white outline-none transition-all duration-200 bg-white/5 caret-indigo-400
                        ${digit
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/30'
                          : 'border-white/10 focus:border-indigo-500'
                        }`}
          />
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerify}
        disabled={isVerifying || otpValue.length !== 6}
        className="mb-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition disabled:opacity-50"
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Verifying…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" /> Verify & Login
          </span>
        )}
      </motion.button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in <span className="font-semibold text-indigo-400">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Sending…' : "Didn't receive it? Resend OTP"}
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/auth/register" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Register
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">
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
        <Suspense fallback={
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4 animate-pulse">
            <div className="mx-auto h-20 w-20 rounded-full bg-white/10" />
            <div className="h-8 rounded-xl bg-white/10" />
            <div className="h-4 rounded-xl bg-white/10 w-3/4 mx-auto" />
            <div className="flex gap-3 justify-center mt-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-14 w-12 rounded-xl bg-white/10" />)}
            </div>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  );
}

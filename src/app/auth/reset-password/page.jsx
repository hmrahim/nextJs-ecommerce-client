// 📁 PATH: src/app/auth/reset-password/page.jsx
// ✅ OTP verify + নতুন password সেট → auto-login হয়ে home এ যাবে
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase and number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') || '';

  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPass]   = useState(false);
  const [showConfirm,  setShowConf]   = useState(false);
  const [isLoading,    setIsLoading]  = useState(false);
  const inputRefs = useRef([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const newPassword = watch('newPassword', '');
  const getStrength = () => {
    let s = 0;
    if (newPassword.length >= 8)          s++;
    if (/[A-Z]/.test(newPassword))        s++;
    if (/[0-9]/.test(newPassword))        s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  };
  const strength = getStrength();
  const strengthColor =
    strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500'
    : strength === 3 ? 'bg-blue-500' : 'bg-green-500';

  /* ── OTP input handlers ──────────────────────────────────── */
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
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

  /* ── Submit ──────────────────────────────────────────────── */
  const onSubmit = async (data) => {
    if (otpValue.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setIsLoading(true);
    try {
      const res = await api.post('/reset-password', {
        email,
        otp:         otpValue,
        newPassword: data.newPassword,
      });

      const { token, user } = res.data;

      // ✅ Auto-login
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user',  JSON.stringify(user));
      }

      toast.success('Password reset! You are now logged in.');
      router.push('/');
      router.refresh();
    } catch (err) {
      const errData = err?.response?.data;
      toast.error(errData?.message || 'Reset failed. Try again.');
      if (errData?.expired) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.07)]">

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Lock className="h-9 w-9 text-white" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold text-white">Reset Password</h1>
          <p className="mb-1 text-center text-gray-400 text-sm">OTP sent to</p>
          <p className="mb-8 text-center font-semibold text-indigo-400 text-sm break-all">{email}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* OTP */}
            <div>
              <p className="mb-3 text-sm text-gray-400 text-center">Enter the 6-digit OTP</p>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`h-14 w-12 rounded-xl border text-center text-2xl font-bold
                      text-white outline-none transition-all duration-200 bg-white/5 caret-indigo-400
                      ${digit
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/30'
                        : 'border-white/10 focus:border-indigo-500'}`}
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword')}
                  placeholder="New Password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-white outline-none transition focus:border-indigo-500"
                />
                <button type="button" onClick={() => setShowPass(!showPassword)} className="absolute right-4 top-4">
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full transition-all duration-500 ${strengthColor}`} style={{ width: `${strength * 25}%` }} />
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Confirm New Password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-white outline-none transition focus:border-indigo-500"
                />
                <button type="button" onClick={() => setShowConf(!showConfirm)} className="absolute right-4 top-4">
                  {showConfirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || otpValue.length !== 6}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Resetting…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Reset & Login
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/forgot-password" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition">
              <ArrowLeft className="h-4 w-4" /> Resend OTP
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

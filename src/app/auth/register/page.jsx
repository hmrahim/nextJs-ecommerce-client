// 📁 PATH: src/app/auth/register/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters'),
  email:     z.string().email('Invalid email address'),
  phone:     z.string().regex(/^[0-9]{11}$/, 'Phone must be 11 digits'),
  password:  z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain uppercase, lowercase and number'
    ),
});

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthColor =
    strength <= 1 ? 'bg-red-500'
    : strength === 2 ? 'bg-yellow-500'
    : strength === 3 ? 'bg-blue-500'
    : 'bg-green-500';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/register', data);
      const resData  = response.data;

      // ✅ email টা response থেকে নাও, না পেলে form থেকে নাও
      const emailToVerify = resData.email || data.email;

      toast.success('Account created! Please verify your email.');
      router.push(`/auth/verify-email?email=${encodeURIComponent(emailToVerify)}`);

    } catch (error) {
      const errData = error?.response?.data;
      const msg     = errData?.message || 'Signup failed';

      // unverified account already exists → verify page এ পাঠাও
      if (errData?.requiresVerification) {
        const emailToVerify = errData.email || data.email;
        toast.error('Account exists but not verified. Please check your email for OTP.');
        router.push(`/auth/verify-email?email=${encodeURIComponent(emailToVerify)}`);
        return;
      }

      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-purple-600 blur-[120px]" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.08)]">

          <h1 className="mb-2 text-center text-4xl font-bold text-white">
            Create Account
          </h1>
          <p className="mb-8 text-center text-gray-400">
            Start your shopping journey
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    {...register('firstName')}
                    placeholder="First Name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-indigo-500"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    {...register('lastName')}
                    placeholder="Last Name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-indigo-500"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  {...register('email')}
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-indigo-500"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <div className="relative">
                <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  {...register('phone')}
                  placeholder="Phone Number (11 digits)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-indigo-500"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-white outline-none transition focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword
                    ? <EyeOff className="h-5 w-5 text-gray-400" />
                    : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>

              {/* Password strength bar */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                  style={{ width: `${strength * 25}%` }}
                />
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition disabled:opacity-60"
            >
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-gray-400">
            Already have an account?
            <Link href="/auth/login" className="ml-2 cursor-pointer text-indigo-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';
// 📁 PATH: src/app/(client)/account/settings/page.jsx

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

/* ── small reusable field ──────────────────────────────────── */
function Field({ label, id, error, children }) {
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="block mb-1 font-medium text-slate-700">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none
        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
        disabled:bg-slate-50 disabled:text-slate-400 transition ${className}`}
      {...props}
    />
  );
}

/* ── Password Strength Meter ───────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const config = [
    { label: '',        bar: 'bg-slate-200' },
    { label: 'Weak',   bar: 'bg-rose-500'   },
    { label: 'Fair',   bar: 'bg-amber-500'  },
    { label: 'Good',   bar: 'bg-blue-500'   },
    { label: 'Strong', bar: 'bg-emerald-500'},
  ];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? config[strength].bar : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs font-medium ${
          strength === 1 ? 'text-rose-500' :
          strength === 2 ? 'text-amber-500' :
          strength === 3 ? 'text-blue-500' : 'text-emerald-600'
        }`}>
          {config[strength].label}
        </p>
      )}
    </div>
  );
}

/* ── Password Input with show/hide toggle ──────────────────── */
function PasswordInput({ id, placeholder, registration, className = '' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={placeholder || '••••••••'}
        className={`w-full rounded-lg border border-border px-3 py-2.5 pr-10 text-sm outline-none
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition ${className}`}
        {...registration}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  TABS                                                       */
/* ═══════════════════════════════════════════════════════════ */

/* ── Profile tab ───────────────────────────────────────────── */
function ProfileTab({ profile, onSave, onAvatarUpload, saving, avatarUploading, avatarProgress }) {
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName:  profile.lastName  || '',
        phone:     profile.phone     || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const res = await onSave(data);
    if (res?.success) toast.success('Profile updated!');
    else toast.error(res?.error || 'Failed to save');
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPreviewUrl(local);
    const res = await onAvatarUpload(file);
    if (res?.success) {
      toast.success('Photo updated!');
      URL.revokeObjectURL(local);
      setPreviewUrl(null);
    } else {
      toast.error(res?.error || 'Upload failed');
      URL.revokeObjectURL(local);
      setPreviewUrl(null);
    }
    e.target.value = '';
  };

  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  const avatarSrc = previewUrl || profile?.avatar || null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700
            flex items-center justify-center text-2xl font-bold text-white">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Avatar"
                width={80} height={80}
                className="h-full w-full object-cover"
                unoptimized={!!previewUrl}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {avatarUploading ? (
            <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
              {avatarProgress > 0 && (
                <span className="text-[10px] text-white mt-0.5">{avatarProgress}%</span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-emerald-600 hover:bg-emerald-500
                border-2 border-white flex items-center justify-center transition-colors shadow"
              title="Change photo"
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            {profile?.firstName} {profile?.lastName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>
          <p className="text-xs text-slate-400 mt-2">JPG, PNG or WebP · max 3 MB</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" id="firstName" error={errors.firstName?.message}>
          <Input
            id="firstName"
            {...register('firstName', { required: 'Required' })}
            placeholder="First name"
          />
        </Field>

        <Field label="Last name" id="lastName" error={errors.lastName?.message}>
          <Input
            id="lastName"
            {...register('lastName', { required: 'Required' })}
            placeholder="Last name"
          />
        </Field>

        <Field label="Email" id="email">
          <Input
            id="email"
            type="email"
            value={profile?.email || ''}
            disabled
            readOnly
          />
        </Field>

        <Field label="Phone" id="phone">
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+966 5XX XXX XXXX"
          />
        </Field>
      </div>

      <button
        onClick={onSubmit}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700
          disabled:opacity-50 text-white text-sm font-semibold transition-colors"
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          <><Check className="h-4 w-4" /> Save changes</>
        )}
      </button>
    </div>
  );
}

/* ── Password tab ──────────────────────────────────────────── */
function PasswordTab({ onChangePassword, saving }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const newPw     = watch('newPassword', '');
  const confirmPw = watch('confirmPassword', '');

  const passwordsMatch = confirmPw && newPw === confirmPw;
  const passwordsMismatch = confirmPw && newPw !== confirmPw;

  const onSubmit = handleSubmit(async (data) => {
    const res = await onChangePassword({
      currentPassword: data.currentPassword,
      newPassword:     data.newPassword,
    });
    if (res?.success) {
      toast.success('Password changed successfully!');
      reset();
    } else {
      toast.error(res?.error || 'Failed to change password');
    }
  });

  return (
    <div className="space-y-5 max-w-md">

      {/* Current Password */}
      <Field label="Current password" id="currentPassword" error={errors.currentPassword?.message}>
        <PasswordInput
          id="currentPassword"
          placeholder="Enter current password"
          registration={register('currentPassword', { required: 'Current password is required' })}
        />
      </Field>

      {/* New Password */}
      <div>
        <Field label="New password" id="newPassword" error={errors.newPassword?.message}>
          <PasswordInput
            id="newPassword"
            placeholder="Enter new password"
            registration={register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
              validate: (v) =>
                v !== watch('currentPassword') || 'New password must differ from current password',
            })}
          />
        </Field>
        <PasswordStrength password={newPw} />
      </div>

      {/* Confirm Password */}
      <div>
        <Field label="Confirm new password" id="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repeat new password"
            registration={register('confirmPassword', {
              required: 'Please confirm your new password',
              validate: (v) => v === newPw || 'Passwords do not match',
            })}
            className={
              passwordsMatch    ? 'border-emerald-500 focus:border-emerald-500' :
              passwordsMismatch ? 'border-rose-400   focus:border-rose-400'    : ''
            }
          />
        </Field>
        {/* Real-time match indicator */}
        {confirmPw && (
          <p className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
            passwordsMatch ? 'text-emerald-600' : 'text-rose-500'
          }`}>
            {passwordsMatch ? (
              <><Check className="h-3.5 w-3.5" /> Passwords match</>
            ) : (
              <><span className="text-base leading-none">✗</span> Passwords do not match</>
            )}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700
          disabled:opacity-50 text-white text-sm font-semibold transition-colors mt-2"
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
        ) : (
          <><Check className="h-4 w-4" /> Update password</>
        )}
      </button>
    </div>
  );
}

/* ── Notifications tab ─────────────────────────────────────── */
function NotificationsTab() {
  const items = [
    { key: 'order',      title: 'Order updates',   desc: 'Shipment, delivery and receipt notifications', defaultOn: true  },
    { key: 'promo',      title: 'Promotions',       desc: 'Discounts and exclusive offers',              defaultOn: true  },
    { key: 'wishlist',   title: 'Wishlist alerts',  desc: 'When wishlist items drop in price',           defaultOn: false },
    { key: 'newsletter', title: 'Newsletter',       desc: 'Weekly product roundup',                      defaultOn: false },
  ];
  return (
    <ul className="divide-y divide-border max-w-2xl">
      {items.map(({ key, title, desc, defaultOn }) => (
        <li key={key} className="py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
            <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition" />
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition peer-checked:translate-x-4" />
          </label>
        </li>
      ))}
    </ul>
  );
}

/* ── Privacy tab ───────────────────────────────────────────── */
function PrivacyTab() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
        <p className="font-semibold text-amber-900 text-sm">Download your data</p>
        <p className="text-xs text-amber-800 mt-1">
          Get a JSON export of your account, orders, addresses and wishlists.
        </p>
        <button
          onClick={() => toast('Export requested — you will receive an email shortly')}
          className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-white border border-border font-semibold hover:bg-amber-50 transition"
        >
          Request export
        </button>
      </div>

      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50">
        <p className="font-semibold text-rose-900 text-sm">Delete account</p>
        <p className="text-xs text-rose-800 mt-1">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <button
          onClick={() => toast.error('Please contact support to delete your account')}
          className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition"
        >
          Request deletion
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  PAGE                                                       */
/* ═══════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'profile',       label: 'Profile'       },
  { id: 'security',      label: 'Password'      },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy',       label: 'Privacy'       },
];

export default function AccountSettingsPage() {
  const [tab, setTab] = useState('profile');

  const {
    profile, loading, saving, error,
    avatarUploading, avatarProgress,
    updateProfile, uploadAvatar, changePassword,
  } = useProfile();

  return (
    <div className="space-y-4">

      {/* Header + tabs */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h1 className="text-xl font-bold">Account settings</h1>
        <div className="mt-4 flex gap-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-border p-6">

        {/* global API error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && tab === 'profile' ? (
          <div className="animate-pulse space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {tab === 'profile' && (
              <ProfileTab
                profile={profile}
                onSave={updateProfile}
                onAvatarUpload={uploadAvatar}
                saving={saving}
                avatarUploading={avatarUploading}
                avatarProgress={avatarProgress}
              />
            )}
            {tab === 'security' && (
              <PasswordTab onChangePassword={changePassword} saving={saving} />
            )}
            {tab === 'notifications' && <NotificationsTab />}
            {tab === 'privacy'       && <PrivacyTab />}
          </>
        )}
      </div>
    </div>
  );
}

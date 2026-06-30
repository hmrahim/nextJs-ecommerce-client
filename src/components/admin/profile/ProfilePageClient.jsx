// 📁 PATH: src/components/admin/profile/ProfilePageClient.jsx
'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useProfile }         from '@/hooks/useProfile';
import ProfileNav             from './ProfileNav';
import PersonalInfoPanel      from './PersonalInfoPanel';
import AddressesPanel         from './AddressesPanel';
import PaymentPanel           from './PaymentPanel';
import SecurityPanel          from './SecurityPanel';
import NotificationsPanel     from './NotificationsPanel';
import ActivityPanel          from './ActivityPanel';
import ProfileToast           from './ProfileToast';

const TAB_META = {
  personal:      { title: 'Personal information',  sub: 'Manage your name, email, and contact details' },
  addresses:     { title: 'Addresses',              sub: 'Add or edit your delivery locations' },
  payment:       { title: 'Payment methods',        sub: 'Manage cards, wallet, and billing' },
  security:      { title: 'Password & security',    sub: 'Change password, 2FA, and active sessions' },
  notifications: { title: 'Notifications',          sub: 'Control what alerts you receive and how' },
  activity:      { title: 'Activity log',           sub: 'A full record of actions on your account' },
};

export default function ProfilePageClient() {
  const [activeTab, setActiveTab] = useState('personal');
  const [toast,     setToast]     = useState(null);

  const {
    profile, loading, saving, error,
    avatarUploading, avatarProgress,
    updateProfile, uploadAvatar, changePassword,
    addAddress, updateAddress, deleteAddress, setDefaultAddress,
    deleteCard, requestDeletion,
  } = useProfile();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Handlers ─────────────────────────────────────────────────
  const handleSavePersonal = async (data) => {
    const res = await updateProfile(data);
    if (res.success) showToast('Profile updated successfully');
    else showToast(res.error || 'Failed to save', 'error');
  };

  const handleAvatarUpload = async (file) => {
    const res = await uploadAvatar(file);
    if (res.success) showToast('Profile photo updated');
    else showToast(res.error || 'Failed to upload photo', 'error');
    return res;
  };

  const handleChangePassword = async (data) => {
    const res = await changePassword(data);
    if (res.success) showToast('Password changed');
    else showToast(res.error || 'Failed to change password', 'error');
    return res;
  };

  const handleAddAddress = async (address) => {
    const res = await addAddress(address);
    if (res.success) showToast('Address added');
    else showToast(res.error || 'Failed to add address', 'error');
  };

  const handleUpdateAddress = async (id, address) => {
    const res = await updateAddress(id, address);
    if (res.success) showToast('Address updated');
    else showToast(res.error || 'Failed to update', 'error');
  };

  const handleDeleteAddress = async (id) => {
    const res = await deleteAddress(id);
    if (res.success) showToast('Address removed');
    else showToast(res.error || 'Failed to remove', 'error');
  };

  const handleSetDefaultAddress = async (id) => {
    const res = await setDefaultAddress(id);
    if (res.success) showToast('Default address updated');
    else showToast(res.error || 'Failed', 'error');
  };

  const handleDeleteCard = async (cardType) => {
    const res = await deleteCard(cardType);
    if (res.success) showToast('Card removed');
    else showToast(res.error || 'Failed to remove card', 'error');
  };

  const meta = TAB_META[activeTab];

  // ── Derived display values ────────────────────────────────────
  const initials  = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName  = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User';
  const avatarSrc = profile?.avatar || null;

  // ── Skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex gap-6 animate-pulse">
        <div className="w-52 flex-shrink-0 space-y-2">
          <div className="h-24 rounded-xl bg-[#13131a] border border-[#1e1e2e]" />
          <div className="h-8 rounded-xl bg-[#13131a] border border-[#1e1e2e]" />
          <div className="h-8 rounded-xl bg-[#13131a] border border-[#1e1e2e]" />
          <div className="h-8 rounded-xl bg-[#13131a] border border-[#1e1e2e]" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-28 rounded-xl bg-[#13131a] border border-[#1e1e2e]" />
          <div className="h-48 rounded-xl bg-[#13131a] border border-[#1e1e2e]" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          {meta.title}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{meta.sub}</p>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Sidebar ── */}
        <aside className="w-52 flex-shrink-0 sticky top-4">

          {/* Avatar card — real image or initials */}
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4 mb-3">
            <div className="flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-violet-500/20 border border-violet-500/30
                flex items-center justify-center text-lg font-bold text-violet-300 mb-2.5 relative">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={fullName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                {/* Uploading overlay */}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <svg className="w-4 h-4 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-white text-sm font-semibold truncate w-full">{fullName}</p>
              <p className="text-slate-500 text-xs truncate w-full mt-0.5">{profile?.email}</p>
              <div className="mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20 capitalize">
                  {profile?.role || 'user'}
                </span>
              </div>
            </div>
          </div>

          <ProfileNav activeTab={activeTab} onChange={setActiveTab} />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'personal' && (
            <PersonalInfoPanel
              profile={profile}
              onSave={handleSavePersonal}
              onAvatarUpload={handleAvatarUpload}
              saving={saving}
              avatarUploading={avatarUploading}
              avatarProgress={avatarProgress}
            />
          )}
          {activeTab === 'addresses' && (
            <AddressesPanel
              profile={profile}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              onSetDefaultAddress={handleSetDefaultAddress}
            />
          )}
          {activeTab === 'payment' && (
            <PaymentPanel profile={profile} onDeleteCard={handleDeleteCard} />
          )}
          {activeTab === 'security' && (
            <SecurityPanel onChangePassword={handleChangePassword} saving={saving} />
          )}
          {activeTab === 'notifications' && <NotificationsPanel />}
          {activeTab === 'activity'      && <ActivityPanel />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <ProfileToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

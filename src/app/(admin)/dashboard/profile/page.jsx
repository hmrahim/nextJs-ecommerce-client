// 📁 PATH: src/app/(admin)/dashboard/profile/page.jsx
import ProfilePageClient from '@/components/admin/profile/ProfilePageClient';

export const metadata = {
  title: 'My Profile — Moom24 Admin',
  description: 'Manage your account details, addresses, security, and preferences',
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}

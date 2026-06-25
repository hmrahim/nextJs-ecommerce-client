import ResetPasswordForm from '@/components/client/reset-password/ResetPasswordForm';
import { Suspense } from 'react';


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black text-white">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
import Link from "next/link";
import { User, Mail, Lock, Phone } from "lucide-react";
function Signup() {
  return <div className="container-x py-12">
      <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Already have one? <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link></p>
        <div className="mt-6 space-y-3">
          <div className="relative"><User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input className="w-full rounded-lg border border-border py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="Full name" /></div>
          <div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input className="w-full rounded-lg border border-border py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="Email address" /></div>
          <div className="relative"><Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input className="w-full rounded-lg border border-border py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="Phone number" /></div>
          <div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input type="password" className="w-full rounded-lg border border-border py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="Create password" /></div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5 accent-emerald-600" /> I agree to the Terms of Service and Privacy Policy. Send me deals & updates.</label>
          <button className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700">Create Account</button>
        </div>
      </div>
    </div>;
}
export {
  Signup as default
};

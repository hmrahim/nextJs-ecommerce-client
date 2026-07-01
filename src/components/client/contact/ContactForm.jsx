// 📁 PATH: src/components/client/contact/ContactForm.jsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { contactService } from "@/services/contactService";

const SUBJECT_OPTIONS = [
  "Order issue",
  "Vendor question",
  "Bulk / B2B order",
  "Account & billing",
  "Partnerships",
  "Press",
];

const EMPTY_FORM = { name: "", email: "", phone: "", subject: SUBJECT_OPTIONS[0], message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }
    if (!form.message.trim()) next.message = "Please write your message";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await contactService.send(form);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm(EMPTY_FORM);
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <div>
        <input
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${
            errors.name ? "border-destructive" : "border-border"
          }`}
          placeholder="Your name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>

      <div>
        <input
          type="email"
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${
            errors.email ? "border-destructive" : "border-border"
          }`}
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>

      <input
        className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] sm:col-span-2"
        placeholder="Phone (optional)"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />

      <select
        className="rounded-lg border border-border px-4 py-3 text-sm outline-none sm:col-span-2"
        value={form.subject}
        onChange={(e) => update("subject", e.target.value)}
      >
        {SUBJECT_OPTIONS.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>

      <div className="sm:col-span-2">
        <textarea
          rows={6}
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${
            errors.message ? "border-destructive" : "border-border"
          }`}
          placeholder="How can we help?"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 font-semibold text-white hover:bg-[var(--color-primary-deep)] disabled:opacity-60 sm:col-span-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
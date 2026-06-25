'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, Leaf, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-16">

      {/* Decorative green blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent/30 blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/20 blur-[110px]"
        />
        <motion.div
          animate={{ y: [0, 18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-accent/20 blur-[80px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        {/* Floating leaf icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/15 border border-accent/30"
        >
          <Leaf className="h-10 w-10 text-accent" strokeWidth={1.75} />
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-display text-[6.5rem] sm:text-[8rem] font-extrabold leading-none tracking-tight text-foreground"
        >
          4
          <span className="inline-block text-accent">0</span>
          4
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="mt-2 text-2xl font-semibold text-foreground">
            এই পেজটা খুঁজে পাওয়া যাচ্ছে না
          </p>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            যে পেজটা তুমি খুঁজছো সেটা মুভ হয়ে গেছে, ডিলিট হয়ে গেছে, অথবা কখনোই এখানে ছিল না।
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            হোমে যাও
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-6 py-3 font-semibold text-foreground transition hover:bg-muted hover:-translate-y-0.5"
          >
            <ShoppingBag className="h-4 w-4" />
            শপিং করো
          </Link>
        </motion.div>

        {/* Quick search */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          action="/search"
          className="mx-auto mt-8 flex max-w-sm items-center gap-2 rounded-full border border-foreground/10 bg-muted/60 px-4 py-2.5"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            name="q"
            type="text"
            placeholder="প্রোডাক্ট খুঁজো…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            আগের পেজে ফিরে যাও
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function SectionHeader({ icon, title, link }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold md:text-2xl">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">{icon}</span>
        {title}
      </h2>
      <Link href={link} className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}

export default SectionHeader;

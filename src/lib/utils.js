import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(amount);
}

export function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export function truncate(str, length = 100) {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function getImageUrl(path) {
  if (!path) return '/images/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`;
}

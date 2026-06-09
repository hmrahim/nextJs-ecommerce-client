import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-gray-900 text-white hover:bg-gray-700',
  secondary: 'bg-white border border-gray-300 hover:bg-gray-50',
  accent: 'bg-orange-500 text-white hover:bg-orange-600',
  ghost: 'hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ children, variant = 'primary', className, disabled, ...props }) {
  return (
    <button
      className={cn('px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

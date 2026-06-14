// 📁 PATH: src/lib/schemas/coupon.schema.js
// Zod schema for coupon form validation + API payload transformer

import { z } from 'zod';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Code must be at least 3 characters')
      .max(20, 'Code cannot exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, - and _ allowed')
      .transform((v) => v.toUpperCase()),

    type: z.enum(['percent', 'fixed', 'shipping'], {
      required_error: 'Discount type is required',
    }),

    value: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
      z
        .number({ invalid_type_error: 'Enter a valid number' })
        .min(0, 'Value cannot be negative')
        .optional()
    ),

    minOrderAmount: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
      z.number().min(0, 'Cannot be negative').default(0)
    ),

    maxUses: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
      z.number().int('Must be a whole number').min(1, 'Must be at least 1').optional()
    ),

    maxUsesPerUser: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? 1 : Number(v)),
      z.number().int('Must be a whole number').min(1, 'Must be at least 1').default(1)
    ),

    isActive: z.boolean().default(true),

    startDate: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v : undefined)),

    expiresAt: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v : undefined)),

    description: z
      .string()
      .max(200, 'Description cannot exceed 200 characters')
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    applicableTo: z.enum(['all', 'category', 'product']).default('all'),

    products: z.array(z.string()).default([]),

    categories: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    // value is required unless type is 'shipping'
    if (data.type !== 'shipping' && (data.value === undefined || data.value === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Discount value is required',
        path: ['value'],
      });
    }

    // percent must be 1–100
    if (data.type === 'percent' && data.value !== undefined) {
      if (data.value < 1 || data.value > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percentage must be between 1 and 100',
          path: ['value'],
        });
      }
    }

    // expiresAt must not be in the past
    if (data.expiresAt) {
      const exp = new Date(data.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (exp < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date cannot be in the past',
          path: ['expiresAt'],
        });
      }
    }

    // startDate must be before expiresAt
    if (data.startDate && data.expiresAt) {
      if (new Date(data.startDate) >= new Date(data.expiresAt)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start date must be before expiry date',
          path: ['startDate'],
        });
      }
    }
  });

// ─── Transform form data → API payload ───────────────────────────────────────
export function toApiPayload(formData) {
  const payload = {
    code:           formData.code,
    type:           formData.type,
    isActive:       formData.isActive,
    minOrderAmount: Number(formData.minOrderAmount) || 0,
    maxUsesPerUser: Number(formData.maxUsesPerUser) || 1,
    applicableTo:   formData.applicableTo || 'all',
  };

  // value: shipping coupons may omit it (backend treats as 0)
  if (formData.type === 'shipping') {
    payload.value = Number(formData.value) || 0;
  } else {
    payload.value = Number(formData.value);
  }

  // Optional fields — only send if filled
  if (formData.maxUses && Number(formData.maxUses) >= 1) {
    payload.maxUses = Number(formData.maxUses);
  }

  if (formData.description && formData.description.trim()) {
    payload.description = formData.description.trim();
  }

  if (formData.startDate && formData.startDate.trim()) {
    payload.startDate = new Date(formData.startDate).toISOString();
  }

  if (formData.expiresAt && formData.expiresAt.trim()) {
    payload.expiresAt = new Date(formData.expiresAt).toISOString();
  }

  if (formData.applicableTo === 'product' && formData.products?.length) {
    payload.products = formData.products;
  }

  if (formData.applicableTo === 'category' && formData.categories?.length) {
    payload.categories = formData.categories;
  }

  return payload;
}

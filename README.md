# Moom24 — E-Commerce Frontend

Built with **Next.js 15**, **Tailwind CSS v4**, **Zustand**, **NextAuth**.

## Structure
- `src/app/(client)/` — Customer-facing store
- `src/app/(admin)/` — Admin dashboard (protected)
- `src/app/api/` — NextAuth + webhooks only (business logic in separate backend)

## Getting Started

```bash
cp .env.example .env.local
# Fill in your API URL, NextAuth secret, Stripe keys

npm install
npm run dev
```

## Key Files
| File | Purpose |
|------|---------|
| `middleware.js` | Route protection for admin & account |
| `src/lib/api.js` | Axios instance with auth headers |
| `src/store/cartStore.js` | Zustand cart (persisted) |
| `src/services/` | All backend API calls |
| `src/lib/validators.js` | Zod form schemas |

## Environment Variables
See `.env.example` for all required variables.

# PawTrust

PawTrust is a verified animal marketplace for Benelux. The app uses Next.js 16, Supabase Auth, Supabase Postgres, Supabase Storage, and Stripe-ready seller plans.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and add your Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Apply Supabase SQL in this order when the target project is active:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_storage_buckets.sql
supabase/migrations/003_documents_and_inquiry_counts.sql
supabase/seed.sql
```

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000/en`.

## Supabase Notes

- Supabase Auth is the source of truth for sessions.
- API routes use `SUPABASE_SERVICE_ROLE_KEY` only on the server.
- Public listings must have `status = active`.
- Seller-created listings are submitted as `pending_review` before publication.
- `listing-images` is public storage.
- `listing-documents` is private storage.
- `avatars` is public storage.

## Verification

```bash
npm run lint
npm run build
```

Both commands should complete without errors.

# Yellow Code Trims

Company website + admin panel (CMS, quote requests, sales orders, invoices, billing) for a garments-trims manufacturer.

## Quick start (local)

```bash
npm install
cp .env.example .env    # fill the values
npx prisma migrate deploy
npm run db:seed
npm run dev             # http://localhost:3000 · admin: /admin/login
```

Full step-by-step instructions — including free hosting on **Vercel** with a **Neon** Postgres database and **Vercel Blob** file storage — are in **[DEPLOY.md](./DEPLOY.md)**.

Put your logo at `public/logo.png`. Admin: `/admin/login`.

## Storage

Cloudinary if its 3 keys are set, else **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`). Upload limit 4 MB per file (Vercel request limit).

## Database notes (Neon)

- Migrations (`prisma migrate deploy`) must run against the **direct** Neon connection string (host without `-pooler`).
- The app at runtime can use the **pooled** string — the codebase avoids Prisma interactive transactions on purpose (they fail behind PgBouncer/Neon poolers with "Transaction API error: Transaction not found").

## Phases

- Orders phase 1 (priced quotes, approval, sales orders): `npx prisma migrate dev --name orders_phase1` (additive only).
- Orders phase 2 (invoices): `npx prisma migrate dev --name invoices_phase2`. Set the company profile in Admin > Company profile before issuing.
- Orders phase 3+4 (bill generation, dashboard): `npx prisma migrate dev --name billing_phase3`.

Access: Sales orders, Invoices and Bill generation are visible to ADMIN, SALES and ACCOUNTS; Company profile to ADMIN and ACCOUNTS; EDITOR is redirected.

Fresh database: delete `prisma/migrations` if present, `npx prisma migrate dev --name init` (y to reset), `npx prisma db seed`.
Discounts support percentage or fixed amount (discountType/discountValue). Customers module at `/admin/customers`.

## Error handling

Server actions never throw user-facing errors; they return `{ error }` and the admin UI shows them as **toasts** (bottom-right). Anything uncaught surfaces on the error page with the real message and a digest reference.

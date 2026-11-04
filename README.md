# Yellow Code Trims

<<<<<<< HEAD
Company website + admin panel (CMS, quote requests, sales orders, invoices, payments, billing, reports) for a garments-trims manufacturer.
=======
Company website + admin panel (CMS, quote requests, sales orders, invoices, billing) for a garments-trims manufacturer.
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc

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
<<<<<<< HEAD
- v6 (payments, reports, search): `npx prisma migrate deploy` applies `20261103111718_payments_and_partial_status` automatically (adds the `Payment` table, `PARTIAL` invoice status and backfills one synthetic payment for every invoice that was marked paid earlier).

Access: Sales orders, Invoices, Bill generation and Reports are visible to ADMIN, SALES and ACCOUNTS; recording payments is ADMIN and ACCOUNTS only; Company profile to ADMIN and ACCOUNTS; EDITOR is redirected.

## Customer invoice links

The public invoice page lives at `/invoice/<token>`. The base URL of the link shown in the admin and inside invoice emails is resolved in this order:

1. **Company profile → Public site URL** (Admin > Company profile) — recommended; change it there any time.
2. `NEXT_PUBLIC_SITE_URL` environment variable.
3. `http://localhost:3000` fallback (local development).

## Payments

Record payments on a local invoice from the invoice page or its sales-order page: amount (cannot exceed the remaining due), method (bank transfer / cash / cheque / mobile banking / card / other), reference, date, note. Status flow: ISSUED → SENT → PARTIAL → PAID; deleting payments recalculates the status automatically. Proforma invoices are not payment documents (unchanged rule).

## Reports

`/admin/reports` — Sales, Receivables (aging), Collections, Sales by item, Customer statement, Business pipeline. Filters + CSV export on each.
=======

Access: Sales orders, Invoices and Bill generation are visible to ADMIN, SALES and ACCOUNTS; Company profile to ADMIN and ACCOUNTS; EDITOR is redirected.
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc

Fresh database: delete `prisma/migrations` if present, `npx prisma migrate dev --name init` (y to reset), `npx prisma db seed`.
Discounts support percentage or fixed amount (discountType/discountValue). Customers module at `/admin/customers`.

## Error handling

Server actions never throw user-facing errors; they return `{ error }` and the admin UI shows them as **toasts** (bottom-right). Anything uncaught surfaces on the error page with the real message and a digest reference.

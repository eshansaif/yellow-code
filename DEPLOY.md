# Deploy guide — local run, Neon DB, Vercel (free tier)

> **Version: v7.** See `VERSION.txt` for the full history. Quick check that you
> are running the latest build: log in to the admin panel — the sidebar footer
> shows "Yellow Code admin · v7".

Two ways to run this project:

1. **Locally** — for development.
2. **Free hosting on Vercel** — database on Neon (free Postgres), file uploads on Vercel Blob (free tier).

---

## 1. Run locally

Requirements: Node 20+, and a Postgres database (local Postgres **or** a free Neon database — see section 2 first if you want to use Neon locally).

```bash
npm install                # also runs "prisma generate"
cp .env.example .env       # then fill in the values (see below)
npx prisma migrate deploy  # creates all tables (or: npx prisma migrate dev)
npm run db:seed            # creates your admin user + starter content
npm run dev                # http://localhost:3000  (admin: /admin/login)
```

Minimum values in `.env` for local run:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yellowcode
AUTH_SECRET=<any long random string>       # generate: npx auth secret
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com                # used by the seed to create your login
ADMIN_PASSWORD=<at least 8 characters>
```

If you have no local Postgres, just use Neon (next section) as your local database too — set `DATABASE_URL` to the Neon **direct** string while running migrations/seed.

Admin panel: open `/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## 2. Create the free Neon database (once)

1. Go to <https://neon.com> and sign up (free, no card).
2. Create a project, e.g. `yellowcode`.
3. Neon gives you **two connection strings** — this matters:
   - **Pooled** (host contains `-pooler`, e.g. `ep-xxx-pooler.eu-central-1.aws.neon.tech`): used by the app at runtime.
   - **Direct** (host without `-pooler`): used for `prisma migrate` / `db push`.
4. Copy both from the Neon dashboard (Connect dialog → "Pooled connection" toggle).
   Keep `?sslmode=require` at the end of both.

> Why two strings: the pooled connection goes through a connection pooler in
> transaction mode, which is great for serverless but does not support Prisma
> interactive transactions or migrations. This project's code no longer uses
> interactive transactions, so the pooled URL is safe at runtime — but
> migrations must always use the direct URL.

---

## 3. Deploy to Vercel (free tier) with Vercel Blob storage

### 3.1 Push the code to GitHub

Create a GitHub repo and push this project (do **not** commit `.env`).

### 3.2 Create the Vercel project

1. <https://vercel.com> → sign up free with GitHub.
2. **Add New… → Project** → import your repo. Framework auto-detects Next.js. Don't deploy yet.

### 3.3 Create the Vercel Blob store (file uploads)

1. In your Vercel project: **Storage tab → Create Database → Blob**.
2. Name it `yellowcode-media`, create, then **Connect to Project** (select your project).
   Vercel adds `BLOB_READ_WRITE_TOKEN` to the project automatically.

The app uses Vercel Blob whenever the Cloudinary keys are empty — with just
this token, product images / logos / quote attachments upload to Blob. The
public upload limit is 4 MB per file (Vercel request limit).

### 3.4 Environment variables

In Vercel → your project → **Settings → Environment Variables**, add:

| Key | Value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Neon **pooled** string (`…-pooler…neon.tech…sslmode=require`) | app runtime |
| `AUTH_SECRET` | long random string (`npx auth secret`) | session signing |
| `AUTH_TRUST_HOST` | `true` | required on Vercel |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (or your domain) | invoice links, emails |
| `BLOB_READ_WRITE_TOKEN` | auto-added by Vercel Blob | uploads |
| `RESEND_API_KEY` | optional, from resend.com (free 100 mails/day) | emails |
| `MAIL_FROM` | e.g. `Yellow Code <onboarding@resend.dev>` | emails |
| `SALES_EMAIL` | optional — gets a copy of new quote requests | emails |

No Cloudinary keys → Blob is used automatically.

### 3.5 Create the tables on Neon (one time, from your computer)

```bash
# in the project folder, temporarily point DATABASE_URL at the DIRECT Neon string
npx prisma migrate deploy
# then seed (creates your admin login + starter content):
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npx prisma db seed
```

(On Windows PowerShell, set env vars with `$env:ADMIN_EMAIL="you@example.com"` first, or put the two ADMIN_ variables into `.env` before running the seed.)

### 3.6 Deploy

Click **Deploy** in Vercel. After it finishes, open your `https://your-app.vercel.app`:

- Site: home page
- Admin: `/admin/login` (seeded email/password)

Later updates: `git push` → Vercel redeploys automatically.

---

## 4. First-run checklist inside the app

1. `/admin/company` — fill the **Company profile** (legal name is required before any invoice can be issued).
   - Set **Public site URL** here too (e.g. `https://your-app.vercel.app`). Customer invoice links and the button inside invoice emails use it. Priority: Company profile → `NEXT_PUBLIC_SITE_URL` env → localhost fallback.
2. `/admin/settings` — real contact details.
3. `/admin/users` — create accounts for sales / accounts staff.
4. Publish categories/products, then set them live.

## 5. What's new in v6

- **Payments** — record payments against local invoices (Admin/Accounts) from the invoice page or the sales-order page: amount, method (bank transfer, cash, cheque, mobile banking, card, other), reference/TRX ID, date and note. Invoice status becomes PARTIAL / PAID automatically; deleting a payment recalculates the status. Invoices that were marked paid before this update got one auto-recorded payment (method "Other") via migration `20261103111718_payments_and_partial_status`.
- **Reports module** (`/admin/reports`, new sidebar group **Insights**) — Sales report, Receivables (due, with aging buckets), Payment collections, Sales by item, Customer statement (running balance), Business pipeline (quote → order conversion). Every report has date-range filters, dropdowns/search where useful, and **Export CSV**.
- **Sidebar global search** — search customers, products, quotes, sales orders and invoices from the sidebar (also understands `SO-2026-000123`, `INV-…`, `#123` style references).
- **Mobile** — the whole admin panel and the public site are fully usable on phones; the sales-order pages were reworked for small screens.

## 6. Common issues

| Symptom | Fix |
| --- | --- |
| `P3018` / `42710: type "Status" already exists` on migrate deploy | The database already has objects but no migration history (after `db push` or a partial setup), so the DB is stuck in "failed migration" state. If the data is disposable: `npx prisma migrate reset --force`. To keep the data: `npx prisma migrate resolve --applied 20261101101810_init`, then `npx prisma db push`, then `npx prisma migrate status`. Against Neon always use only `migrate deploy` — never mix with `db push`. |
| `Transaction API error: Transaction not found` | You are running migrations or old code against the **pooled** URL. Migrate with the direct URL; redeploy the latest code (no interactive transactions). |
| Customer invoice links / email buttons point to `localhost:3000` | The link base is taken from **Admin > Company profile > Public site URL** first, then the `NEXT_PUBLIC_SITE_URL` env var, then the localhost fallback. Set the Public site URL in the Company profile (e.g. `https://yellow-code.vercel.app`) and redeploy nothing — links update immediately. |
| Upload fails with "No storage configured" | Set `BLOB_READ_WRITE_TOKEN` (Vercel Blob) or the three Cloudinary keys. |
| Emails don't arrive | Set `RESEND_API_KEY` + `MAIL_FROM`. Resend requires verifying your domain to send from it; `onboarding@resend.dev` only sends to your own email. |
| `P1001: can't reach database` | Wrong `DATABASE_URL` host/sslmode; check the Neon dashboard. |
| Forgot admin password | Seed a new one: update `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env` and run `npm run db:seed` again (it upserts the admin user). |

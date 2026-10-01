# Yellow Code Trims
Local: install Node 20+, Postgres; cp .env.example .env; npm install; npx prisma migrate dev --name init; npm run db:seed; npm run dev
Vercel: push to GitHub, add env vars, set DATABASE_URL to a hosted Postgres (Neon), run `npx prisma migrate deploy` once, then `npm run db:seed` once.
Put your logo at public/logo.png. Admin: /admin/login

Storage: Cloudinary if its 3 keys are set, else Vercel Blob (BLOB_READ_WRITE_TOKEN). Upload limit 4 MB per file (Vercel request limit).

# Migrations
The schema changed (discountType / discountValue). For a fresh database: delete prisma/migrations if it exists, then run
`npx prisma migrate dev --name init` (answer y to reset) and `npx prisma db seed`.
prisma/scripts/fix-migrations.mjs is only needed to baseline a database that already holds data you must keep.

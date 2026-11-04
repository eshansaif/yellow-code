-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'MOBILE_BANKING', 'CARD', 'OTHER');

-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'PARTIAL';

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: invoices that were marked paid before payment tracking existed get
-- one synthetic payment each, so the paid/due maths stays correct for old data.
INSERT INTO "Payment" ("id", "invoiceId", "amount", "method", "reference", "paidAt", "recordedById")
SELECT 'paylegacy_' || i."id", i."id",
       GREATEST(0, ROUND(t."total", 2)),
       'OTHER',
       'Auto-recorded (invoice was marked paid before payment tracking existed)',
       COALESCE(i."paidAt", i."createdAt"),
       i."createdById"
FROM "Invoice" i
CROSS JOIN LATERAL (
  SELECT COALESCE(SUM(l."qty" * l."unitPrice"), 0) AS "sub"
  FROM "InvoiceLine" l WHERE l."invoiceId" = i."id"
) s
CROSS JOIN LATERAL (
  SELECT (s."sub" - CASE WHEN i."discountType" = 'FIXED' THEN LEAST(i."discountValue", s."sub")
                         ELSE s."sub" * LEAST(i."discountValue", 100) / 100 END)
         * (1 + i."taxPct" / 100) AS "total"
) t
WHERE i."status" = 'PAID';

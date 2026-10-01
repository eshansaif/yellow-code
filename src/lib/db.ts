import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { p?: PrismaClient };
export const db = g.p ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.p = db;
export const quoteRef = (seq: number, d = new Date()) => `YC-QT-${d.getFullYear()}-${String(seq).padStart(6, "0")}`;

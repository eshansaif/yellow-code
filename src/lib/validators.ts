import { z } from "zod";
export const ALLOWED_MIME = ["application/pdf","image/png","image/jpeg","image/svg+xml","application/zip","application/postscript","application/illustrator"];
export const MAX_FILE = 4 * 1024 * 1024;
export const quoteSchema = z.object({
  mode: z.enum(["product","general"]),
  productId: z.string().optional(),
  name: z.string().min(2).max(120), company: z.string().min(2).max(160),
  email: z.string().email().max(200), phone: z.string().min(6).max(40),
  country: z.string().min(2).max(80), city: z.string().max(80).optional(), jobTitle: z.string().max(80).optional(),
  quantity: z.coerce.number().int().positive().max(1e9).optional(), unit: z.string().max(20).optional(),
  deadline: z.coerce.date().optional(), message: z.string().max(5000).optional(),
  details: z.record(z.string(), z.string().max(500)).optional(),
  consent: z.literal("on", { message: "Please accept the consent statement." }),
  website: z.string().max(0).optional(), // honeypot
});

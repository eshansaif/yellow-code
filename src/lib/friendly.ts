import { z } from "zod";
// Shared shape for server-action results. Actions never throw user-facing
// errors; they return { error } and the client shows it as a toast / inline.
export type FormState = { error?: string; ok?: string } | null;
const LABEL: Record<string, string> = {
  company: "Company", name: "Name", contact: "Contact name", email: "Email", phone: "Phone",
  country: "Country", city: "City", address: "Address", taxId: "BIN / VAT", discountValue: "Discount",
  taxPct: "Tax", currency: "Currency", validUntil: "Valid until", deliveryDate: "Delivery date",
  legalName: "Legal company name", title: "Title", password: "Password", role: "Role", reason: "Reason",
  body: "Note", alt: "Alt text", to: "Recipient", customerPo: "Customer PO", paymentTerms: "Payment terms",
<<<<<<< HEAD
  amount: "Amount", method: "Payment method", reference: "Reference", paidAt: "Payment date", note: "Note", siteUrl: "Public site URL",
=======
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
};
// Turns any thrown error into a readable sentence (zod issues get field labels).
export function friendly(e: unknown): string {
  if (e instanceof z.ZodError) return e.issues.map(i => `${LABEL[String(i.path[0])] ?? String(i.path[0] ?? "Field")}: ${i.message}`).join(". ");
  return e instanceof Error ? e.message : "Something went wrong. Please try again.";
}
export const fail = (e: unknown): FormState => ({ error: friendly(e) });

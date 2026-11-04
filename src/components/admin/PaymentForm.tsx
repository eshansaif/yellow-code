"use client";
import SearchSelect from "@/components/SearchSelect"; import SubmitButton from "@/components/admin/SubmitButton"; import { ToastForm } from "@/components/admin/ToastForm";
// Record-payment form, reused on the invoice page and on the sales-order page.
export default function PaymentForm({ invoiceId, due, currency, action }: {
  invoiceId: string; due: number; currency: string; action: (fd: FormData) => Promise<{ error?: string; ok?: string } | null | undefined>; }) {
  const today = new Date().toISOString().slice(0, 10);
  return <ToastForm action={action} okMsg="Payment recorded." confirm={undefined} className="mt-4 grid gap-3 rounded-xl border border-dashed border-[#e0d8c6] bg-[#fbfaf6] p-4 sm:grid-cols-2 lg:grid-cols-4">
    <input type="hidden" name="invoiceId" value={invoiceId} />
    <label className="block text-sm">Amount ({currency})<input type="number" name="amount" min="0.01" step="0.01" defaultValue={due.toFixed(2)} required className="mt-1" /></label>
    <label className="block text-sm">Payment method<SearchSelect compact name="method" defaultValue="BANK_TRANSFER" options={[
      { value: "BANK_TRANSFER", label: "Bank transfer" }, { value: "CASH", label: "Cash" }, { value: "CHEQUE", label: "Cheque" },
      { value: "MOBILE_BANKING", label: "Mobile banking (bKash / Nagad)" }, { value: "CARD", label: "Card" }, { value: "OTHER", label: "Other" }]} /></label>
    <label className="block text-sm">Reference / TRX ID<input name="reference" maxLength={120} placeholder="Bank ref, cheque no, bKash TRX…" className="mt-1" /></label>
    <label className="block text-sm">Payment date<input type="date" name="paidAt" defaultValue={today} className="mt-1" /></label>
    <label className="block text-sm sm:col-span-2 lg:col-span-4">Note (optional)<input name="note" maxLength={500} placeholder="Anything worth remembering about this payment" className="mt-1" /></label>
    <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4"><SubmitButton>Record payment</SubmitButton><span className="text-xs text-stone">Remaining due: {due.toFixed(2)} {currency}</span></div>
  </ToastForm>;
}

"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending} className={`${className ?? ""} disabled:cursor-wait disabled:opacity-60`}>{pending ? "Working…" : children}</button>;
}

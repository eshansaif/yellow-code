// Resend over fetch. Env: RESEND_API_KEY, MAIL_FROM, SALES_EMAIL. Swap this one function to change provider.
export async function sendMail(to: string | string[], subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return; // email disabled until configured
  await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, html }) }).catch(() => {});
}
export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

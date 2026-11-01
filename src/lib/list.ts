export type SP = Record<string, string | undefined>;
export function pg(sp: SP, per = 12) { const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1); return { page, take: per, skip: (page - 1) * per }; }
export const ci = (q: string) => ({ contains: q, mode: "insensitive" as const });

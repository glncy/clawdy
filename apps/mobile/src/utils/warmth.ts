export type WarmthLevel = "warm" | "cooling" | "distant";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysSince(fromIso: string, nowIso?: string): number {
  const from = new Date(fromIso).getTime();
  const to = nowIso ? new Date(nowIso).getTime() : Date.now();
  return Math.max(0, Math.floor((to - from) / MS_PER_DAY));
}

export function warmthLevel(days: number | undefined): WarmthLevel {
  if (days === undefined) return "distant";
  if (days <= 7) return "warm";
  if (days <= 21) return "cooling";
  return "distant";
}

export function warmthLabel(
  level: WarmthLevel,
  days: number | undefined,
): string {
  const name =
    level === "warm" ? "Warm" : level === "cooling" ? "Cooling" : "Distant";
  if (days === undefined) return `${name} · no contact yet`;
  return `${name} · ${days} days ago`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
}

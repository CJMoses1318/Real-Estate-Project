import type { UrgencyLevel } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysSinceActivity(
  lastActivityAt: number,
  now: number = Date.now(),
): number {
  return Math.floor((now - lastActivityAt) / MS_PER_DAY);
}

export function getUrgencyLevel(
  lastActivityAt: number,
  now: number = Date.now(),
): UrgencyLevel {
  const days = getDaysSinceActivity(lastActivityAt, now);

  if (days > 10) {
    return "red";
  }

  if (days > 5) {
    return "amber";
  }

  return "none";
}

export function getUrgencyLabel(level: UrgencyLevel): string | null {
  switch (level) {
    case "amber":
      return "Follow up soon";
    case "red":
      return "Urgent: no recent activity";
    default:
      return null;
  }
}

export const URGENCY_STYLES: Record<
  UrgencyLevel,
  { border: string; badge: string; text: string }
> = {
  none: {
    border: "border-zinc-200",
    badge: "bg-emerald-50 text-emerald-800",
    text: "text-zinc-600",
  },
  amber: {
    border: "border-amber-300",
    badge: "bg-amber-50 text-amber-900",
    text: "text-amber-900",
  },
  red: {
    border: "border-red-300",
    badge: "bg-red-50 text-red-900",
    text: "text-red-900",
  },
};

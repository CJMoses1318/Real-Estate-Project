"use client";

import { formatStage } from "@/lib/stages";
import {
  getUrgencyLabel,
  getUrgencyLevel,
  URGENCY_STYLES,
} from "@/lib/urgency";
import type { Client } from "@/lib/types";

export interface ClientCardProps {
  client: Client;
  now?: number;
  onClick?: (clientId: string) => void;
}

export function ClientCard({ client, now, onClick }: ClientCardProps) {
  const urgency = getUrgencyLevel(client.lastActivityAt, now);
  const urgencyLabel = getUrgencyLabel(urgency);
  const styles = URGENCY_STYLES[urgency];

  return (
    <button
      type="button"
      onClick={() => onClick?.(client.id)}
      className={`w-full rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${styles.border}`}
      aria-label={`Open client record for ${client.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{client.name}</h2>
          <p className="text-sm text-zinc-600">{client.email}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}
        >
          {formatStage(client.stage)}
        </span>
      </div>

      <p className={`mt-4 line-clamp-2 text-sm ${styles.text}`}>
        <span className="font-medium text-zinc-700">Latest note: </span>
        {client.latestNote}
      </p>

      {urgencyLabel ? (
        <p
          className={`mt-3 text-xs font-semibold uppercase tracking-wide ${styles.text}`}
          data-testid="urgency-indicator"
        >
          {urgencyLabel}
        </p>
      ) : null}
    </button>
  );
}

import type { ActivityLogEntry } from "@/lib/types";

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

export function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <section aria-labelledby="activity-log-heading">
      <h2 id="activity-log-heading" className="text-lg font-semibold text-zinc-900">
        Activity log
      </h2>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No activity recorded yet.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  {entry.type === "stageChange" ? "Stage change" : "Note"}
                </span>
                <time
                  className="text-xs text-zinc-500"
                  dateTime={new Date(entry.createdAt).toISOString()}
                >
                  {formatTimestamp(entry.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm text-zinc-800">{entry.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

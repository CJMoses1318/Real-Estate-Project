import { formatStage } from "@/lib/stages";
import type { DocumentChecklistItem } from "@/lib/types";

export interface DocumentChecklistProps {
  items: DocumentChecklistItem[];
  currentStage: DocumentChecklistItem["stage"];
  disabled?: boolean;
  onToggle: (documentId: string, complete: boolean) => void;
}

export function DocumentChecklist({
  items,
  currentStage,
  disabled,
  onToggle,
}: DocumentChecklistProps) {
  const stageItems = items.filter((item) => item.stage === currentStage);

  return (
    <section aria-labelledby="document-checklist-heading">
      <h2 id="document-checklist-heading" className="text-lg font-semibold text-zinc-900">
        Document checklist
      </h2>
      <p className="mt-1 text-sm text-zinc-600">
        Required documents for {formatStage(currentStage)}.
      </p>

      {stageItems.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No checklist items for this stage.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {stageItems.map((item) => (
            <li key={item.id}>
              <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
                <input
                  type="checkbox"
                  checked={item.complete}
                  disabled={disabled}
                  onChange={(event) => onToggle(item.id, event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-700"
                  aria-label={`Mark ${item.label} as ${item.complete ? "incomplete" : "complete"}`}
                />
                <span
                  className={`text-sm ${item.complete ? "text-zinc-500 line-through" : "text-zinc-900"}`}
                >
                  {item.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

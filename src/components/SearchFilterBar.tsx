import { formatStage } from "@/lib/stages";
import { DEAL_STAGES } from "@/lib/types";
import type { StageFilter } from "@/lib/filterClients";

export interface SearchFilterBarProps {
  search: string;
  stage: StageFilter;
  onSearchChange: (value: string) => void;
  onStageChange: (value: StageFilter) => void;
}

export function SearchFilterBar({
  search,
  stage,
  onSearchChange,
  onStageChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">Search clients</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          aria-label="Search clients by name or email"
        />
      </label>

      <label className="flex w-full flex-col gap-2 sm:w-56">
        <span className="text-sm font-medium text-zinc-700">Filter by stage</span>
        <select
          value={stage}
          onChange={(event) => onStageChange(event.target.value as StageFilter)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          aria-label="Filter clients by deal stage"
        >
          <option value="all">All stages</option>
          {DEAL_STAGES.map((dealStage) => (
            <option key={dealStage} value={dealStage}>
              {formatStage(dealStage)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

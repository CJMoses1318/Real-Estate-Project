import { DEAL_STAGES } from "@/lib/types";
import { formatStage } from "@/lib/stages";
import type { DealStage } from "@/lib/types";

export interface StageDropdownProps {
  value: DealStage;
  disabled?: boolean;
  onChange: (stage: DealStage) => void;
}

export function StageDropdown({ value, disabled, onChange }: StageDropdownProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">Current stage</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as DealStage)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Update client deal stage"
      >
        {DEAL_STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {formatStage(stage)}
          </option>
        ))}
      </select>
    </label>
  );
}

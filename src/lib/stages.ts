import type { DealStage } from "./types";

export const STAGE_LABELS: Record<DealStage, string> = {
  inquiry: "Inquiry",
  preQualification: "Pre-Qualification",
  propertySearch: "Property Search",
  offerSubmitted: "Offer Submitted",
  underContract: "Under Contract",
  pendingClose: "Pending Close",
  closed: "Closed",
};

export function formatStage(stage: DealStage): string {
  return STAGE_LABELS[stage];
}

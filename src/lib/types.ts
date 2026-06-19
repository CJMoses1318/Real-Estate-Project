export const DEAL_STAGES = [
  "inquiry",
  "preQualification",
  "propertySearch",
  "offerSubmitted",
  "underContract",
  "pendingClose",
  "closed",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export type PropertyType = "buyer" | "seller" | "both";

export type ActivityType = "note" | "stageChange";

export type UrgencyLevel = "none" | "amber" | "red";

export interface Client {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  propertyType: PropertyType;
  budgetMin: number;
  budgetMax: number;
  address?: string;
  searchCriteria?: string;
  stage: DealStage;
  latestNote: string;
  lastActivityAt: number;
  createdAt: number;
}

export interface ActivityLogEntry {
  id: string;
  clientId: string;
  type: ActivityType;
  message: string;
  createdAt: number;
}

export interface DocumentChecklistItem {
  id: string;
  clientId: string;
  stage: DealStage;
  label: string;
  complete: boolean;
}

export interface CreateClientInput {
  name: string;
  email: string;
  phone: string;
  propertyType: PropertyType;
  budgetMin: number;
  budgetMax: number;
  address?: string;
  searchCriteria?: string;
  firstNote?: string;
}

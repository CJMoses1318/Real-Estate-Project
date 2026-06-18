import type {
  ActivityLogEntry,
  Client,
  CreateClientInput,
  DocumentChecklistItem,
} from "./types";

export const DEFAULT_DOCUMENT_CHECKLIST: Record<
  Client["stage"],
  readonly string[]
> = {
  inquiry: ["Initial consultation notes", "Buyer/seller questionnaire"],
  preQualification: ["Pre-approval letter", "Proof of funds"],
  propertySearch: ["Signed buyer representation agreement", "Search criteria summary"],
  offerSubmitted: ["Purchase agreement", "Earnest money receipt"],
  underContract: ["Inspection report", "Appraisal report"],
  pendingClose: ["Title commitment", "Closing disclosure"],
  closed: ["Final closing statement", "Keys handoff confirmation"],
};

export function mapClientDoc(
  id: string,
  data: Record<string, unknown>,
): Client {
  return {
    id,
    ownerId: String(data.ownerId),
    name: String(data.name),
    email: String(data.email),
    phone: String(data.phone),
    propertyType: data.propertyType as Client["propertyType"],
    budgetMin: Number(data.budgetMin),
    budgetMax: Number(data.budgetMax),
    address: data.address ? String(data.address) : undefined,
    searchCriteria: data.searchCriteria ? String(data.searchCriteria) : undefined,
    stage: data.stage as Client["stage"],
    lastActivityAt: Number(data.lastActivityAt),
    createdAt: Number(data.createdAt),
  };
}

export function buildChecklistItems(
  clientId: string,
): Omit<DocumentChecklistItem, "id">[] {
  return Object.entries(DEFAULT_DOCUMENT_CHECKLIST).flatMap(([stage, labels]) =>
    labels.map((label) => ({
      clientId,
      stage: stage as Client["stage"],
      label,
      complete: false,
    })),
  );
}

export function buildInitialActivityEntries(
  clientId: string,
  input: CreateClientInput,
  now: number,
): Omit<ActivityLogEntry, "id">[] {
  const entries: Omit<ActivityLogEntry, "id">[] = [
    {
      clientId,
      type: "note",
      message: "Client intake completed.",
      createdAt: now,
    },
  ];

  if (input.firstNote) {
    entries.push({
      clientId,
      type: "note",
      message: input.firstNote,
      createdAt: now,
    });
  }

  return entries;
}

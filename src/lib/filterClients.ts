import type { Client, DealStage } from "./types";

export type StageFilter = DealStage | "all";

export function filterClients(
  clients: Client[],
  search: string,
  stage: StageFilter,
): Client[] {
  const query = search.trim().toLowerCase();

  return clients.filter((client) => {
    const matchesStage = stage === "all" || client.stage === stage;
    const matchesSearch =
      query.length === 0 ||
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query);

    return matchesStage && matchesSearch;
  });
}

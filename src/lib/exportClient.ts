import { formatStage } from "@/lib/stages";
import type { Client } from "@/lib/types";

export function buildClientExportSummary(client: Client): string {
  const lines = [
    "Client Status Summary",
    "===================",
    `Name: ${client.name}`,
    `Email: ${client.email}`,
    `Phone: ${client.phone}`,
    `Property type: ${client.propertyType}`,
    `Budget: $${client.budgetMin.toLocaleString()} - $${client.budgetMax.toLocaleString()}`,
    `Current stage: ${formatStage(client.stage)}`,
    `Latest note: ${client.latestNote}`,
  ];

  if (client.address) {
    lines.push(`Address: ${client.address}`);
  }

  if (client.searchCriteria) {
    lines.push(`Search criteria: ${client.searchCriteria}`);
  }

  lines.push(
    `Last activity: ${new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(client.lastActivityAt))}`,
  );

  return lines.join("\n");
}

export async function copyClientExportSummary(client: Client): Promise<void> {
  const summary = buildClientExportSummary(client);

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary);
    return;
  }

  const blob = new Blob([summary], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${client.name.replace(/\s+/g, "-").toLowerCase()}-summary.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

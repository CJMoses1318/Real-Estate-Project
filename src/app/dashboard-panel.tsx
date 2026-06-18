"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Client } from "@/lib/types";

interface DashboardPanelProps {
  initialClients: Client[];
}

export function DashboardPanel({ initialClients }: DashboardPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const createSampleClient = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jordan Lee",
          email: "jordan.lee@example.com",
          phone: "619-555-0142",
          propertyType: "buyer",
          budgetMin: 450000,
          budgetMax: 650000,
          searchCriteria: "3 bed, 2 bath near North Park",
          firstNote: "Prefers move-in ready homes with a yard.",
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to create client";
        throw new Error(errorMessage);
      }

      setStatus("idle");
      setMessage("Sample client created successfully.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to create client");
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Week 1 foundation: authenticated API routes connected to Firestore.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100"
          >
            Refresh clients
          </button>
          <button
            type="button"
            onClick={() => void createSampleClient()}
            disabled={status === "loading"}
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Add sample client
          </button>
        </div>
      </div>

      {message ? (
        <p
          className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}

      {initialClients.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
          No clients yet. Use &quot;Add sample client&quot; to verify the POST route.
        </p>
      ) : null}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {initialClients.map((client) => (
          <li
            key={client.id}
            className="rounded-xl border border-zinc-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{client.name}</h2>
                <p className="text-sm text-zinc-600">{client.email}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                {client.stage}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd>{client.phone}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Budget</dt>
                <dd>
                  ${client.budgetMin.toLocaleString()} - $
                  {client.budgetMax.toLocaleString()}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AddClientForm } from "@/components/AddClientForm";
import { ClientCard } from "@/components/ClientCard";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { useClientsListener } from "@/hooks/useClientsListener";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { filterClients, type StageFilter } from "@/lib/filterClients";

export function DashboardPanel() {
  const router = useRouter();
  const { userId } = useAuth();
  const { ready: firebaseReady, error: firebaseError } = useFirebaseAuth();
  const {
    clients,
    loading,
    error: listenerError,
  } = useClientsListener(userId, firebaseReady);
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  const filteredClients = useMemo(
    () => filterClients(clients, search, stageFilter),
    [clients, search, stageFilter],
  );

  const connectionError = firebaseError ?? listenerError;
  const isLoading = !firebaseReady || loading;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Active clients update in real time as deal activity changes.
          </p>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-8">
          <h2 className="text-lg font-semibold text-zinc-900">Add new client</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Capture intake details to start tracking a new pipeline record.
          </p>
          <div className="mt-4">
            <AddClientForm
              disabled={!firebaseReady}
              onSuccess={() => {
                setStatus("idle");
                setMessage("Client created successfully.");
              }}
            />
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

        {connectionError ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {connectionError}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <SearchFilterBar
          search={search}
          stage={stageFilter}
          onSearchChange={setSearch}
          onStageChange={setStageFilter}
        />

        {isLoading ? (
          <p className="mt-6 text-sm text-zinc-500">Loading clients...</p>
        ) : null}

        {!isLoading && clients.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
            No clients yet. Use the intake form above to create your first pipeline
            record.
          </p>
        ) : null}

        {!isLoading && clients.length > 0 && filteredClients.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
            No clients match your current search or stage filter.
          </p>
        ) : null}

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <li key={client.id}>
              <ClientCard
                client={client}
                onClick={(clientId) => router.push(`/clients/${clientId}`)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

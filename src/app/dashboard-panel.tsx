"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ClientCard } from "@/components/ClientCard";
import { useClientsListener } from "@/hooks/useClientsListener";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

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
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to create client");
    }
  };

  const connectionError = firebaseError ?? listenerError;
  const isLoading = !firebaseReady || loading;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Active clients update in real time as deal activity changes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void createSampleClient()}
          disabled={status === "loading" || !firebaseReady}
          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Add sample client
        </button>
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

      {isLoading ? (
        <p className="mt-6 text-sm text-zinc-500">Loading clients...</p>
      ) : null}

      {!isLoading && clients.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
          No clients yet. Use &quot;Add sample client&quot; to create your first
          pipeline record.
        </p>
      ) : null}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <li key={client.id}>
            <ClientCard
              client={client}
              onClick={(clientId) => router.push(`/clients/${clientId}`)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

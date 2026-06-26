"use client";

import Link from "next/link";
import { useState } from "react";

import { ActivityLog } from "@/components/ActivityLog";
import { DocumentChecklist } from "@/components/DocumentChecklist";
import { StageDropdown } from "@/components/StageDropdown";
import { useClientDetail } from "@/hooks/useClientDetail";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { formatStage } from "@/lib/stages";
import type { DealStage } from "@/lib/types";

interface ClientDetailPanelProps {
  clientId: string;
}

async function parseApiError(response: Response): Promise<string> {
  const data: unknown = await response.json();

  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return "Request failed";
}

export function ClientDetailPanel({ clientId }: ClientDetailPanelProps) {
  const { ready: firebaseReady, error: firebaseError } = useFirebaseAuth();
  const { client, activity, documents, loading, error } = useClientDetail(
    clientId,
    firebaseReady,
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [isUpdating, setIsUpdating] = useState(false);

  const runUpdate = async (
    body: Record<string, unknown>,
    successMessage: string,
  ) => {
    setIsUpdating(true);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      setStatus("idle");
      setMessage(successMessage);
    } catch (updateError) {
      setStatus("error");
      setMessage(
        updateError instanceof Error ? updateError.message : "Update failed",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStageChange = async (stage: DealStage) => {
    if (!client || stage === client.stage) {
      return;
    }

    await runUpdate({ action: "updateStage", stage }, "Stage updated.");
  };

  const handleAddNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setStatus("error");
      setMessage("Enter a note before saving.");
      return;
    }

    await runUpdate({ action: "addNote", note: trimmedNote }, "Note added.");
    setNote("");
  };

  const handleToggleDocument = async (documentId: string, complete: boolean) => {
    await runUpdate(
      { action: "toggleDocument", documentId, complete },
      complete ? "Document marked complete." : "Document marked incomplete.",
    );
  };

  const connectionError = firebaseError ?? error;

  if (!firebaseReady || loading) {
    return <p className="text-sm text-zinc-500">Loading client details...</p>;
  }

  if (connectionError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {connectionError}
      </p>
    );
  }

  if (!client) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-zinc-600">Client not found.</p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Current stage: {formatStage(client.stage)}
            </p>
          </div>
          <StageDropdown
            value={client.stage}
            disabled={isUpdating}
            onChange={(stage) => void handleStageChange(stage)}
          />
        </div>

        {message ? (
          <p
            className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-zinc-500">Email</dt>
            <dd className="text-sm font-medium text-zinc-900">{client.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Phone</dt>
            <dd className="text-sm font-medium text-zinc-900">{client.phone}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Property type</dt>
            <dd className="text-sm font-medium capitalize text-zinc-900">
              {client.propertyType}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Budget</dt>
            <dd className="text-sm font-medium text-zinc-900">
              ${client.budgetMin.toLocaleString()} - $
              {client.budgetMax.toLocaleString()}
            </dd>
          </div>
          {client.address ? (
            <div>
              <dt className="text-sm text-zinc-500">Address</dt>
              <dd className="text-sm font-medium text-zinc-900">{client.address}</dd>
            </div>
          ) : null}
          {client.searchCriteria ? (
            <div className="sm:col-span-2">
              <dt className="text-sm text-zinc-500">Search criteria</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {client.searchCriteria}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <DocumentChecklist
            items={documents}
            currentStage={client.stage}
            disabled={isUpdating}
            onToggle={(documentId, complete) =>
              void handleToggleDocument(documentId, complete)
            }
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <ActivityLog entries={activity} />

          <form className="mt-8 space-y-3" onSubmit={(event) => void handleAddNote(event)}>
            <label className="flex flex-col gap-2" htmlFor="client-note">
              <span className="text-sm font-medium text-zinc-700">Add note</span>
              <textarea
                id="client-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                disabled={isUpdating}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Follow-up call scheduled for Friday..."
              />
            </label>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Save note
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

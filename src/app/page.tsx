import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { mapClientDoc } from "@/lib/clients";
import { getAdminDb } from "@/lib/firebaseAdmin";
import type { Client } from "@/lib/types";

import { DashboardPanel } from "./dashboard-panel";

async function getClientsForUser(userId: string): Promise<Client[]> {
  try {
    const snapshot = await getAdminDb()
      .collection("clients")
      .where("ownerId", "==", userId)
      .orderBy("lastActivityAt", "desc")
      .get();

    return snapshot.docs.map((doc) => mapClientDoc(doc.id, doc.data()));
  } catch (error) {
    console.error("Failed to load clients for dashboard:", error);
    return [];
  }
}

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Manage your real estate pipeline in one place
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Sign in to access your client dashboard, track deal stages, and keep
            activity logs up to date.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  const initialClients = await getClientsForUser(userId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <DashboardPanel initialClients={initialClients} />
    </main>
  );
}

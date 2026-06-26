import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientDetailPanel } from "./client-detail-panel";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">Sign in required</h1>
          <p className="mt-2 text-zinc-600">
            Sign in to view this client record.
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

  if (!id) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <ClientDetailPanel clientId={id} />
    </main>
  );
}

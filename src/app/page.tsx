import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { DashboardPanel } from "./dashboard-panel";

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <DashboardPanel />
    </main>
  );
}

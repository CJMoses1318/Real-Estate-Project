"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Real Estate Tracker
          </p>
          <p className="text-sm text-zinc-600">Client intake and case progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Show
            when="signed-out"
            fallback={<UserButton />}
          >
            <SignInButton mode="modal">
              <button className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
                Sign in
              </button>
            </SignInButton>
          </Show>
        </div>
      </div>
    </header>
  );
}

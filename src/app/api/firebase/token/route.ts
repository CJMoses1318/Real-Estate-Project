import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createFirebaseCustomToken } from "@/lib/firebaseAdmin";

export async function GET(): Promise<
  NextResponse<{ token: string } | { error: string }>
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await createFirebaseCustomToken(userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("GET /api/firebase/token failed:", error);
    return NextResponse.json(
      { error: "Failed to create Firebase auth token" },
      { status: 500 },
    );
  }
}

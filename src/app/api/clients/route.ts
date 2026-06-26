import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  buildChecklistItems,
  buildInitialActivityEntries,
  getLatestNoteFromIntake,
  mapClientDoc,
} from "@/lib/clients";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { createClientSchema } from "@/lib/schemas";
import type { Client } from "@/lib/types";

export async function GET(): Promise<NextResponse<Client[] | { error: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getAdminDb()
      .collection("clients")
      .where("ownerId", "==", userId)
      .orderBy("lastActivityAt", "desc")
      .get();

    const clients = snapshot.docs.map((doc) => mapClientDoc(doc.id, doc.data()));

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/clients failed:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<Client | { error: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 },
      );
    }

    const now = Date.now();
    const db = getAdminDb();
    const clientRef = db.collection("clients").doc();

    const latestNote = getLatestNoteFromIntake(parsed.data);

    const clientData = {
      ownerId: userId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      propertyType: parsed.data.propertyType,
      budgetMin: parsed.data.budgetMin,
      budgetMax: parsed.data.budgetMax,
      ...(parsed.data.address ? { address: parsed.data.address } : {}),
      ...(parsed.data.searchCriteria
        ? { searchCriteria: parsed.data.searchCriteria }
        : {}),
      stage: "inquiry" as const,
      latestNote,
      lastActivityAt: now,
      createdAt: now,
    };

    const batch = db.batch();
    batch.set(clientRef, clientData);

    for (const entry of buildInitialActivityEntries(clientRef.id, parsed.data, now)) {
      const activityRef = clientRef.collection("activity").doc();
      batch.set(activityRef, entry);
    }

    for (const item of buildChecklistItems(clientRef.id)) {
      const documentRef = clientRef.collection("documents").doc();
      batch.set(documentRef, item);
    }

    await batch.commit();

    return NextResponse.json(mapClientDoc(clientRef.id, clientData), { status: 201 });
  } catch (error) {
    console.error("POST /api/clients failed:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

import { auth } from "@clerk/nextjs/server";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import {
  formatStageChangeMessage,
  mapActivityDoc,
  mapClientDoc,
  mapDocumentDoc,
} from "@/lib/clients";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { updateClientSchema } from "@/lib/schemas";
import { DEAL_STAGES } from "@/lib/types";
import type { ActivityLogEntry, Client, DocumentChecklistItem } from "@/lib/types";

interface ClientDetailResponse {
  client: Client;
  activity: ActivityLogEntry[];
  documents: DocumentChecklistItem[];
}

async function getOwnedClient(
  clientId: string,
  userId: string,
): Promise<DocumentSnapshot | null> {
  const clientDoc = await getAdminDb().collection("clients").doc(clientId).get();

  if (!clientDoc.exists) {
    return null;
  }

  const data = clientDoc.data();
  if (!data || data.ownerId !== userId) {
    return null;
  }

  return clientDoc;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<ClientDetailResponse | { error: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const clientDoc = await getOwnedClient(id, userId);

    if (!clientDoc) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const db = getAdminDb();
    const clientRef = db.collection("clients").doc(id);

    const [activitySnapshot, documentsSnapshot] = await Promise.all([
      clientRef.collection("activity").orderBy("createdAt", "desc").get(),
      clientRef.collection("documents").get(),
    ]);

    const documents = documentsSnapshot.docs
      .map((document) => mapDocumentDoc(document.id, document.data()))
      .sort(
        (a, b) => DEAL_STAGES.indexOf(a.stage) - DEAL_STAGES.indexOf(b.stage),
      );

    return NextResponse.json({
      client: mapClientDoc(clientDoc.id, clientDoc.data() ?? {}),
      activity: activitySnapshot.docs.map((doc) =>
        mapActivityDoc(doc.id, doc.data()),
      ),
      documents,
    });
  } catch (error) {
    console.error("GET /api/clients/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<Client | { error: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const clientDoc = await getOwnedClient(id, userId);

    if (!clientDoc) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const clientRef = db.collection("clients").doc(id);
    const now = Date.now();
    const batch = db.batch();

    if (parsed.data.action === "updateStage") {
      const message = formatStageChangeMessage(parsed.data.stage);

      batch.update(clientRef, {
        stage: parsed.data.stage,
        latestNote: message,
        lastActivityAt: now,
      });

      const activityRef = clientRef.collection("activity").doc();
      batch.set(activityRef, {
        clientId: id,
        type: "stageChange",
        message,
        createdAt: now,
      });
    }

    if (parsed.data.action === "addNote") {
      batch.update(clientRef, {
        latestNote: parsed.data.note,
        lastActivityAt: now,
      });

      const activityRef = clientRef.collection("activity").doc();
      batch.set(activityRef, {
        clientId: id,
        type: "note",
        message: parsed.data.note,
        createdAt: now,
      });
    }

    if (parsed.data.action === "toggleDocument") {
      const documentRef = clientRef.collection("documents").doc(parsed.data.documentId);
      const documentDoc = await documentRef.get();

      if (!documentDoc.exists) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      batch.update(documentRef, { complete: parsed.data.complete });
    }

    await batch.commit();

    const updatedClient = await clientRef.get();

    return NextResponse.json(
      mapClientDoc(updatedClient.id, updatedClient.data() ?? {}),
    );
  } catch (error) {
    console.error("PUT /api/clients/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

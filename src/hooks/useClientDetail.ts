"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  mapActivityDoc,
  mapClientDoc,
  mapDocumentDoc,
} from "@/lib/clients";
import { getClientDb } from "@/lib/firebaseClient";
import { DEAL_STAGES } from "@/lib/types";
import type { ActivityLogEntry, Client, DocumentChecklistItem } from "@/lib/types";

interface ClientDetailState {
  client: Client | null;
  activity: ActivityLogEntry[];
  documents: DocumentChecklistItem[];
  loading: boolean;
  error: string | null;
}

const EMPTY_STATE: ClientDetailState = {
  client: null,
  activity: [],
  documents: [],
  loading: false,
  error: null,
};

function sortDocuments(items: DocumentChecklistItem[]): DocumentChecklistItem[] {
  return [...items].sort(
    (a, b) => DEAL_STAGES.indexOf(a.stage) - DEAL_STAGES.indexOf(b.stage),
  );
}

export function useClientDetail(
  clientId: string | null | undefined,
  enabled: boolean,
): ClientDetailState {
  const isActive = enabled && Boolean(clientId);
  const [state, setState] = useState<ClientDetailState>({
    ...EMPTY_STATE,
    loading: isActive,
  });

  useEffect(() => {
    if (!isActive || !clientId) {
      return;
    }

    const db = getClientDb();
    const clientRef = doc(db, "clients", clientId);
    const activityQuery = query(
      collection(db, "clients", clientId, "activity"),
      orderBy("createdAt", "desc"),
    );
    const documentsQuery = collection(db, "clients", clientId, "documents");

    let clientData: Client | null = null;
    let activityData: ActivityLogEntry[] = [];
    let documentsData: DocumentChecklistItem[] = [];
    let clientReady = false;
    let activityReady = false;
    let documentsReady = false;

    const publish = (overrides?: Partial<ClientDetailState>) => {
      setState({
        client: clientData,
        activity: activityData,
        documents: documentsData,
        loading: !(clientReady && activityReady && documentsReady),
        error: null,
        ...overrides,
      });
    };

    const unsubscribeClient = onSnapshot(
      clientRef,
      (snapshot) => {
        clientReady = true;
        clientData = snapshot.exists()
          ? mapClientDoc(snapshot.id, snapshot.data())
          : null;
        publish();
      },
      (error) => {
        setState({
          ...EMPTY_STATE,
          loading: false,
          error: error.message,
        });
      },
    );

    const unsubscribeActivity = onSnapshot(
      activityQuery,
      (snapshot) => {
        activityReady = true;
        activityData = snapshot.docs.map((entry) =>
          mapActivityDoc(entry.id, entry.data()),
        );
        publish();
      },
      (error) => {
        setState({
          ...EMPTY_STATE,
          loading: false,
          error: error.message,
        });
      },
    );

    const unsubscribeDocuments = onSnapshot(
      documentsQuery,
      (snapshot) => {
        documentsReady = true;
        documentsData = sortDocuments(
          snapshot.docs.map((entry) => mapDocumentDoc(entry.id, entry.data())),
        );
        publish();
      },
      (error) => {
        setState({
          ...EMPTY_STATE,
          loading: false,
          error: error.message,
        });
      },
    );

    return () => {
      unsubscribeClient();
      unsubscribeActivity();
      unsubscribeDocuments();
    };
  }, [clientId, isActive]);

  if (!isActive) {
    return EMPTY_STATE;
  }

  return state;
}

"use client";

import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { mapClientDoc } from "@/lib/clients";
import { getClientDb } from "@/lib/firebaseClient";
import type { Client } from "@/lib/types";

interface ClientsListenerState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const EMPTY_STATE: ClientsListenerState = {
  clients: [],
  loading: false,
  error: null,
};

export function useClientsListener(
  userId: string | null | undefined,
  enabled: boolean,
): ClientsListenerState {
  const isActive = enabled && Boolean(userId);
  const [state, setState] = useState<ClientsListenerState>({
    clients: [],
    loading: isActive,
    error: null,
  });

  useEffect(() => {
    if (!isActive || !userId) {
      return;
    }

    const clientsQuery = query(
      collection(getClientDb(), "clients"),
      where("ownerId", "==", userId),
      orderBy("lastActivityAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        setState({
          clients: snapshot.docs.map((doc) => mapClientDoc(doc.id, doc.data())),
          loading: false,
          error: null,
        });
      },
      (snapshotError) => {
        setState({
          clients: [],
          loading: false,
          error: snapshotError.message,
        });
      },
    );

    return unsubscribe;
  }, [isActive, userId]);

  if (!isActive) {
    return EMPTY_STATE;
  }

  return state;
}

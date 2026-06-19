"use client";

import { useAuth } from "@clerk/nextjs";
import { signInWithCustomToken } from "firebase/auth";
import { useEffect, useState } from "react";

import { getClientAuth } from "@/lib/firebaseClient";

interface FirebaseAuthState {
  ready: boolean;
  error: string | null;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const { isLoaded, userId } = useAuth();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    let cancelled = false;

    async function authenticateWithFirebase() {
      try {
        const auth = getClientAuth();

        if (auth.currentUser?.uid === userId) {
          if (!cancelled) {
            setReady(true);
            setError(null);
          }
          return;
        }

        const response = await fetch("/api/firebase/token");
        const data: unknown = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "Failed to authenticate with Firebase";
          throw new Error(errorMessage);
        }

        if (
          typeof data !== "object" ||
          data === null ||
          !("token" in data) ||
          typeof data.token !== "string"
        ) {
          throw new Error("Invalid Firebase token response");
        }

        await signInWithCustomToken(auth, data.token);

        if (!cancelled) {
          setReady(true);
          setError(null);
        }
      } catch (authError) {
        if (!cancelled) {
          setReady(false);
          setError(
            authError instanceof Error
              ? authError.message
              : "Failed to authenticate with Firebase",
          );
        }
      }
    }

    void authenticateWithFirebase();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  if (!isLoaded || !userId) {
    return { ready: false, error: null };
  }

  return { ready, error };
}

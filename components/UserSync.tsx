"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    async function createOrUpdateUser() {
      if (!isLoaded || !user || hasSynced) return;

      try {
        console.log("[UserSync] Starting sync for user:", user.id);
        // Sync user data from Clerk to Convex
        const result = await syncUser({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.fullName || user.firstName || "User",
        });
        console.log("[UserSync] Sync successful:", result);
        setHasSynced(true);
      } catch (error) {
        console.error("[UserSync] Error syncing user:", error);
        // Retry after a delay
        setTimeout(() => {
          setHasSynced(false);
        }, 2000);
      }
    }

    createOrUpdateUser();
  }, [isLoaded, user, syncUser, hasSynced]);

  return null;
}
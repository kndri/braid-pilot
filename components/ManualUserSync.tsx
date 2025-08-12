"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ManualUserSync() {
  const { user } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const result = await syncUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.firstName || "User",
      });
      setSyncResult(`Success: ${result.action}`);
      // Reload after successful sync
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Manual sync error:", error);
      setSyncResult(`Error: ${error}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleManualSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm disabled:opacity-50"
      >
        {isSyncing ? "Syncing..." : "Manual Sync"}
      </button>
      {syncResult && (
        <p className="text-xs text-gray-600">{syncResult}</p>
      )}
    </div>
  );
}
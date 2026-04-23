"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefundActions({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function decide(status: "approved" | "rejected") {
    start(async () => {
      await fetch(`/api/refunds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="success" onClick={() => decide("approved")} disabled={pending}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={() => decide("rejected")} disabled={pending}>
        Reject
      </Button>
    </div>
  );
}

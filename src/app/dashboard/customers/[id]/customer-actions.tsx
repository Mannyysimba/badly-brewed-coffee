"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function CustomerActions({ id, status }: { id: number; status: "active" | "suspended" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      const next = status === "active" ? "suspended" : "active";
      await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  return (
    <div>
      <Button variant={status === "active" ? "destructive" : "success"} onClick={toggle} disabled={pending}>
        {pending ? "Saving..." : status === "active" ? "Suspend" : "Reactivate"}
      </Button>
    </div>
  );
}

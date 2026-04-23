"use client";

import { Badge, Button, Td, Tr } from "@/components/ui";
import type { User } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function EmployeeRow({ user, joined }: { user: User; joined: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      const next = user.status === "active" ? "suspended" : "active";
      await fetch(`/api/employees/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Remove ${user.name}? This cannot be undone.`)) return;
    start(async () => {
      await fetch(`/api/employees/${user.id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <Tr>
      <Td className="font-medium">{user.name}</Td>
      <Td className="text-xs text-muted">{user.email}</Td>
      <Td>
        <Badge tone={user.role === "admin" ? "info" : user.role === "manager" ? "neutral" : "ok"}>
          {user.role}
        </Badge>
      </Td>
      <Td>
        <Badge tone={user.status === "active" ? "ok" : "err"}>{user.status}</Badge>
      </Td>
      <Td className="text-xs text-muted">{joined}</Td>
      <Td>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={toggle} disabled={pending}>
            {user.status === "active" ? "Suspend" : "Reactivate"}
          </Button>
          <Button size="sm" variant="destructive" onClick={remove} disabled={pending}>
            Remove
          </Button>
        </div>
      </Td>
    </Tr>
  );
}

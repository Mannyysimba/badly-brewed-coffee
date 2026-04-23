import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { ne, desc } from "drizzle-orm";
import { Card, Badge, Table, Th, Td, Tr, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { UserCog } from "lucide-react";
import { EmployeeCreate } from "./employee-create";
import { EmployeeRow } from "./employee-row";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const rows = db
    .select()
    .from(users)
    .where(ne(users.role, "customer"))
    .orderBy(desc(users.createdAt))
    .all();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-muted mt-1">{rows.length} staff member{rows.length === 1 ? "" : "s"}</p>
        </div>
        <EmployeeCreate />
      </div>

      <Card className="p-0 overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<UserCog className="h-5 w-5" />} title="No employees yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <EmployeeRow key={u.id} user={u} joined={formatDate(u.createdAt)} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

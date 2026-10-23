"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageTicketsClient from "./ManageTicketsClient";

export default function TicketsPage() {
  return (
    <PermissionGuard permissionKey="tickets">
      <ManageTicketsClient />
    </PermissionGuard>
  );
}

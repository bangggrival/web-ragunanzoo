"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageTicketContentClient from "./ManageTicketContentClient";

export default function TicketContentPage() {
  return (
    <PermissionGuard permissionKey="ticket-content">
      <ManageTicketContentClient />
    </PermissionGuard>
  );
}

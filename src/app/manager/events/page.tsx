"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageEventsClient from "./ManageEventsClient";

export default function EventsPage() {
  return (
    <PermissionGuard permissionKey="events">
      <ManageEventsClient />
    </PermissionGuard>
  );
}

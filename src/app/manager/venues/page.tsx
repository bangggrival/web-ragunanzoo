"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageVenuesClient from "./ManageVenuesClient";

export default function VenuesPage() {
  return (
    <PermissionGuard permissionKey="venues">
      <ManageVenuesClient />
    </PermissionGuard>
  );
}

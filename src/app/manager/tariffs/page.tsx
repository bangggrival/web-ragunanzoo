"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageTariffsClient from "./ManageTariffsClient";

export default function TariffsPage() {
  return (
    <PermissionGuard permissionKey="ticket-content">
      <ManageTariffsClient />
    </PermissionGuard>
  );
}

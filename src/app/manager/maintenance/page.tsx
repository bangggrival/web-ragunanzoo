"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageMaintenancePage from "./ManageMaintenancePage";

export default function MaintenancePage() {
  return (
    <PermissionGuard permissionKey="system-configs">
      <ManageMaintenancePage />
    </PermissionGuard>
  );
}

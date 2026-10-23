"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageServiceSettingsClient from "./ManageServiceSettingsClient";

export default function ServiceSettingsPage() {
  return (
    <PermissionGuard permissionKey="service-settings">
      <ManageServiceSettingsClient />
    </PermissionGuard>
  );
}

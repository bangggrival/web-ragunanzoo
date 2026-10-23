"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageServiceStandardsClient from "./ManageServiceStandardsClient";

export default function ServiceStandardsPage() {
  return (
    <PermissionGuard permissionKey="service-settings">
      <ManageServiceStandardsClient />
    </PermissionGuard>
  );
}

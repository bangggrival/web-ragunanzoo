"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageWbsClient from "./ManageWbsClient";

export default function WbsPage() {
  return (
    <PermissionGuard permissionKey="wbs">
      <ManageWbsClient />
    </PermissionGuard>
  );
}

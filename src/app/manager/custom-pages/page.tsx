"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageCustomPagesClient from "./ManageCustomPagesClient";

export default function CustomPagesPage() {
  return (
    <PermissionGuard permissionKey="custom-pages">
      <ManageCustomPagesClient />
    </PermissionGuard>
  );
}

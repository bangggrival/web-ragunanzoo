"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageJdihClient from "./ManageJdihClient";

export default function JdihPage() {
  return (
    <PermissionGuard permissionKey="jdih">
      <ManageJdihClient />
    </PermissionGuard>
  );
}

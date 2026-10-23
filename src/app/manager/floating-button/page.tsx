"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageFloatingButtonClient from "./ManageFloatingButtonClient";

export default function FloatingButtonPage() {
  return (
    <PermissionGuard permissionKey="floating-button">
      <ManageFloatingButtonClient />
    </PermissionGuard>
  );
}

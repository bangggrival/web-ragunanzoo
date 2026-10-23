"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageWhatsNewClient from "./ManageWhatsNewClient";

export default function WhatsNewPage() {
  return (
    <PermissionGuard permissionKey="whats-new">
      <ManageWhatsNewClient />
    </PermissionGuard>
  );
}

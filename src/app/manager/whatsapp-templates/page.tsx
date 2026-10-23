"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageWhatsappTemplatesClient from "./ManageWhatsappTemplatesClient";

export default function WhatsappTemplatesPage() {
  return (
    <PermissionGuard permissionKey="whatsapp-templates">
      <ManageWhatsappTemplatesClient />
    </PermissionGuard>
  );
}

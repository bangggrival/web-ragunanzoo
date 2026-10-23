"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageBrandingClient from "./ManageBrandingClient";

export default function BrandingPage() {
  return (
    <PermissionGuard permissionKey="branding">
      <ManageBrandingClient />
    </PermissionGuard>
  );
}

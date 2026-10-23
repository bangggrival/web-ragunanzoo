"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageOrganizationsClient from "./ManageOrganizationsClient";

export default function OrganizationsPage() {
  return (
    <PermissionGuard permissionKey="organizations">
      <ManageOrganizationsClient />
    </PermissionGuard>
  );
}

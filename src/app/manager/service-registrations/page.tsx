"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageServiceRegistrationsClient from "./ManageServiceRegistrationsClient";

export default function ServiceRegistrationsPage() {
  return (
    <PermissionGuard permissionKey="service-registrations">
      <ManageServiceRegistrationsClient />
    </PermissionGuard>
  );
}

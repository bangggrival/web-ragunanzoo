"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageServiceAvailabilityClient from "./ManageServiceAvailabilityClient";

export default function ServiceAvailabilityPage() {
  return (
    <PermissionGuard permissionKey="service-availability">
      <ManageServiceAvailabilityClient />
    </PermissionGuard>
  );
}

"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageTourGuidesClient from "./ManageTourGuidesClient";

export default function TourGuidesPage() {
  return (
    <PermissionGuard permissionKey="tour-guides">
      <ManageTourGuidesClient />
    </PermissionGuard>
  );
}

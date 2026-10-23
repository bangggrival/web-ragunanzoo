"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageMapMarkersClient from "./ManageMapMarkersClient";

export default function MapMarkersPage() {
  return (
    <PermissionGuard permissionKey="map">
      <ManageMapMarkersClient />
    </PermissionGuard>
  );
}

"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageMapClient from "./ManageMapClient";

export default function MapPage() {
  return (
    <PermissionGuard permissionKey="map">
      <ManageMapClient />
    </PermissionGuard>
  );
}

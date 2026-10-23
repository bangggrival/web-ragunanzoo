"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageGpsMapClient from "./ManageGpsMapClient";

export default function GpsMapManagerPage() {
  return (
    <PermissionGuard permissionKey="map">
      <ManageGpsMapClient />
    </PermissionGuard>
  );
}

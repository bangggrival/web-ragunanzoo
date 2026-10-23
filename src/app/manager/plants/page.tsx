"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManagePlantsClient from "./ManagePlantsClient";

export default function PlantsPage() {
  return (
    <PermissionGuard permissionKey="plants">
      <ManagePlantsClient />
    </PermissionGuard>
  );
}

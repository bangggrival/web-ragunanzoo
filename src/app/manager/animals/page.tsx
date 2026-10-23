"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageAnimalsClient from "./ManageAnimalsClient";

export default function AnimalsPage() {
  return (
    <PermissionGuard permissionKey="animals">
      <ManageAnimalsClient />
    </PermissionGuard>
  );
}

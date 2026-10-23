"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageExplorerNavbarClient from "./ManageExplorerNavbarClient";

export default function ExplorerNavbarPage() {
  return (
    <PermissionGuard permissionKey="explorer-navbar">
      <ManageExplorerNavbarClient />
    </PermissionGuard>
  );
}

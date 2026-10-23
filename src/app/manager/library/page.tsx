"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageLibraryClient from "./ManageLibraryClient";

export default function LibraryPage() {
  return (
    <PermissionGuard permissionKey="library">
      <ManageLibraryClient />
    </PermissionGuard>
  );
}

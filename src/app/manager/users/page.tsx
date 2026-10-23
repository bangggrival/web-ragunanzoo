"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageUsersClient from "./ManageUsersClient";

export default function UsersPage() {
  return (
    <PermissionGuard permissionKey="users">
      <ManageUsersClient />
    </PermissionGuard>
  );
}

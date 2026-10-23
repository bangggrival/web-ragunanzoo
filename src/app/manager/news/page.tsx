"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageNewsClient from "./ManageNewsClient";

export default function NewsPage() {
  return (
    <PermissionGuard permissionKey="news">
      <ManageNewsClient />
    </PermissionGuard>
  );
}

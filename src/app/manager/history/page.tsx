"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageHistoryClient from "./ManageHistoryClient";

export default function HistoryPage() {
  return (
    <PermissionGuard permissionKey="history">
      <ManageHistoryClient />
    </PermissionGuard>
  );
}

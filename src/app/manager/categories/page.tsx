"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageCategoriesClient from "./ManageCategoriesClient";

export default function CategoriesPage() {
  return (
    <PermissionGuard permissionKey="categories">
      <ManageCategoriesClient />
    </PermissionGuard>
  );
}

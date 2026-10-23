"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageChatbotFaqsClient from "./ManageChatbotFaqsClient";

export default function ChatbotFaqsPage() {
  return (
    <PermissionGuard permissionKey="chatbot-faqs">
      <ManageChatbotFaqsClient />
    </PermissionGuard>
  );
}

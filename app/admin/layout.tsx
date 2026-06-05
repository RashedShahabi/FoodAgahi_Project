export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import ThemeToggle from "@/components/admin/ThemeToggle";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-vazir"
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* TopBar */}
        <div className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-700 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            مدیریت سیستم
          </h1>

          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}

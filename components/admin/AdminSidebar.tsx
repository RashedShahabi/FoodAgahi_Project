"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  AlertTriangle,
  Gavel,
  Image as ImageIcon,
} from "lucide-react";

const items = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/ads", label: "آگهی‌ها", icon: ShoppingBag },
  { href: "/admin/reports", label: "گزارشات", icon: AlertTriangle },
  { href: "/admin/disputes", label: "اختلافات", icon: Gavel },
  { href: "/admin/banners", label: "بنرها", icon: ImageIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-l dark:border-gray-700 shadow-lg">
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          پنل مدیریت
        </h2>
      </div>

      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition
              ${
                active
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

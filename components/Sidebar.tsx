// app/components/Sidebar.tsx
import Link from "next/link";
import { User, ShoppingBag, FileText, Wallet, LogOut, Bell } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-l p-6 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <h1 className="text-2xl font-bold text-orange-500 mb-10 flex items-center gap-2">
          <Bell size={24} /> FoodAgahi
        </h1>
        <nav className="space-y-4">
          <Link href="/dashboard" className="block py-2 hover:text-orange-500">داشبورد</Link>
          <SidebarLink href="/dashboard/profile" icon={<User size={20}/>} label="پروفایل" />
          <SidebarLink href="/dashboard/seller/new" icon={<ShoppingBag size={20}/>} label="ثبت آگهی" />
          <SidebarLink href="/dashboard/seller/my-ads" icon={<FileText size={20}/>} label="آگهی‌های من" />
          <SidebarLink href="/dashboard/buyer" icon={<ShoppingBag size={20}/>} label="مشاهده آگهی‌ها" />
          <SidebarLink href="/dashboard/wallet" icon={<Wallet size={20}/>} label="کیف پول" />
        </nav>
      </div>
      <button className="flex items-center gap-2 text-gray-500 hover:text-red-500">
        <LogOut size={20} /> خروج
      </button>
    </aside>
  );
}

function SidebarLink({ href, icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition">
      {icon} {label}
    </Link>
  );
}

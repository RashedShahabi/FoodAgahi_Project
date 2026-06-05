import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function UserDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      foodAds: true,        // نام صحیح در اسکیما
      purchaseOrders: true, // سفارش‌های خرید
      saleOrders: true,     // سفارش‌های فروش
    },
  });

  if (!user) return notFound();

  // محاسبه مجموع سفارش‌ها برای نمایش
  const totalOrders = user.purchaseOrders.length + user.saleOrders.length;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold dark:text-white">
        جزئیات کاربر: {user.mobile}
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm">شماره موبایل</p>
            <p className="font-medium">{user.mobile}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm">نقش کاربری</p>
            <p className="font-medium">
              {user.role === "ADMIN" ? "مدیر سیستم" : "دانشجو"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm">موجودی کیف پول</p>
            <p className="font-medium text-green-600">
              {user.balance.toLocaleString()} تومان
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm">تاریخ عضویت</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{user.foodAds.length}</p>
            <p className="text-xs text-gray-500">آگهی‌ها</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{user.purchaseOrders.length}</p>
            <p className="text-xs text-gray-500">خریدها</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{user.saleOrders.length}</p>
            <p className="text-xs text-gray-500">فروش‌ها</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";

export default async function UserDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      ads: true,
      orders: true,
    },
  });

  if (!user) return <div>کاربر پیدا نشد</div>;

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        جزئیات کاربر
      </h1>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow space-y-3">

        <div>موبایل: {user.phone}</div>

        <div>نقش: {user.role}</div>

        <div>
          تاریخ عضویت:
          {new Date(user.createdAt).toLocaleDateString("fa-IR")}
        </div>

        <div>تعداد آگهی‌ها: {user.ads.length}</div>

        <div>تعداد سفارش‌ها: {user.orders.length}</div>

      </div>
    </div>
  );
}

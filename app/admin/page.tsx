import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RevenueChart from "@/components/admin/RevenueChart";

function filterClass(active:boolean){
  return active
    ? "px-3 py-1 rounded bg-blue-600 text-white"
    : "px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800";
}

export default async function AdminDashboard({ searchParams }) {

  const range = searchParams?.range || "all";

  const now = new Date();

  let fromDate: Date | undefined;

  if (range === "today") {
    fromDate = new Date();
    fromDate.setHours(0,0,0,0);
  }

  if (range === "7d") {
    fromDate = new Date();
    fromDate.setDate(now.getDate() - 7);
  }

  if (range === "1m") {
    fromDate = new Date();
    fromDate.setMonth(now.getMonth() - 1);
  }

  if (range === "4m") {
    fromDate = new Date();
    fromDate.setMonth(now.getMonth() - 4);
  }

  if (range === "1y") {
    fromDate = new Date();
    fromDate.setFullYear(now.getFullYear() - 1);
  }

  const dateFilter = fromDate ? { gte: fromDate } : undefined;

  const usersCount = await prisma.user.count({
    where: fromDate ? { createdAt: dateFilter } : {},
  });

  const adsCount = await prisma.foodAd.count({
    where: fromDate ? { createdAt: dateFilter } : {},
  });

  const ordersCount = await prisma.order.count({
    where: fromDate ? { createdAt: dateFilter } : {},
  });

  const revenue = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED",
      ...(fromDate && { createdAt: dateFilter }),
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      status: "COMPLETED",
      ...(fromDate && { createdAt: dateFilter }),
    },
    orderBy: { createdAt: "asc" },
  });

  const chartData = transactions.map((t) => ({
    date: new Date(t.createdAt).toLocaleDateString("fa-IR"),
    amount: t.amount,
  }));


  // ✅ این دو تا جدید هستند

  const reportsCount = await prisma.report.count({
    where:{
      isResolved:false
    }
  });

  const pendingAds = await prisma.foodAd.count({
    where:{
      status:"PENDING"
    }
  });


  return (

    <div className="space-y-8">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold dark:text-white">
          داشبورد مدیریت
        </h1>

        <div className="flex gap-2 text-sm">

          <Link href="?range=today" className={filterClass(range==="today")}>
            امروز
          </Link>

          <Link href="?range=7d" className={filterClass(range==="7d")}>
            7 روز
          </Link>

          <Link href="?range=1m" className={filterClass(range==="1m")}>
            1 ماه
          </Link>

          <Link href="?range=4m" className={filterClass(range==="4m")}>
            4 ماه
          </Link>

          <Link href="?range=1y" className={filterClass(range==="1y")}>
            1 سال
          </Link>

          <Link href="?range=all" className={filterClass(range==="all")}>
            همه
          </Link>

        </div>
      </div>

      {/* ✅ grid را 4 به 6 ستون تبدیل کردیم */}
      <div className="grid grid-cols-6 gap-6">

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          کاربران
          <div className="text-2xl font-bold">
            {usersCount}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          آگهی‌ها
          <div className="text-2xl font-bold">
            {adsCount}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          سفارش‌ها
          <div className="text-2xl font-bold">
            {ordersCount}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          درآمد
          <div className="text-2xl font-bold">
            {revenue._sum.amount || 0}
          </div>
        </div>

        {/* ✅ کارت گزارشات */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          گزارشات باز
          <div className="text-2xl font-bold">
            {reportsCount}
          </div>
        </div>

        {/* ✅ کارت آگهی‌های در انتظار تایید */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          آگهی در انتظار تایید
          <div className="text-2xl font-bold">
            {pendingAds}
          </div>
        </div>

      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">

        <h2 className="mb-4 font-semibold">
          نمودار درآمد
        </h2>

        <RevenueChart data={chartData} />

      </div>

    </div>
  );
}

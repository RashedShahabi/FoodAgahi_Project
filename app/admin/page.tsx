import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RevenueChart from "@/components/admin/RevenueChart";

// تعریف تایپ برای ورودی‌های صفحه
interface AdminDashboardProps {
  searchParams: {
    range?: string;
  };
}

function filterClass(active: boolean) {
  return active
    ? "px-3 py-1 rounded bg-blue-600 text-white"
    : "px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800";
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  // گرفتن مقدار range با اطمینان از استرینگ بودن
  const range = searchParams?.range || "all";

  const now = new Date();
  let fromDate: Date | undefined;

  if (range === "today") {
    fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    fromDate = new Date();
    fromDate.setDate(now.getDate() - 7);
  } else if (range === "1m") {
    fromDate = new Date();
    fromDate.setMonth(now.getMonth() - 1);
  } else if (range === "4m") {
    fromDate = new Date();
    fromDate.setMonth(now.getMonth() - 4);
  } else if (range === "1y") {
    fromDate = new Date();
    fromDate.setFullYear(now.getFullYear() - 1);
  }

  // آماده‌سازی فیلتر تاریخ برای کوئری‌های پریزما
  const dateFilter = fromDate ? { gte: fromDate } : undefined;

  // اجرای کوئری‌ها
  const [usersCount, adsCount, ordersCount, reportsCount, pendingAds, revenueData] = await Promise.all([
    prisma.user.count({ where: fromDate ? { createdAt: dateFilter } : {} }),
    prisma.foodAd.count({ where: fromDate ? { createdAt: dateFilter } : {} }),
    prisma.order.count({ where: fromDate ? { createdAt: dateFilter } : {} }),
    prisma.report.count({ where: { isResolved: false } }),
    prisma.foodAd.count({ where: { status: "PENDING" } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        ...(fromDate && { createdAt: dateFilter }),
      },
    }),
  ]);

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">داشبورد مدیریت</h1>

        <div className="flex gap-2 text-sm">
          <Link href="?range=today" className={filterClass(range === "today")}>امروز</Link>
          <Link href="?range=7d" className={filterClass(range === "7d")}>7 روز</Link>
          <Link href="?range=1m" className={filterClass(range === "1m")}>1 ماه</Link>
          <Link href="?range=4m" className={filterClass(range === "4m")}>4 ماه</Link>
          <Link href="?range=1y" className={filterClass(range === "1y")}>1 سال</Link>
          <Link href="?range=all" className={filterClass(range === "all")}>همه</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard title="کاربران" value={usersCount} />
        <StatCard title="آگهی‌ها" value={adsCount} />
        <StatCard title="سفارش‌ها" value={ordersCount} />
        <StatCard title="درآمد" value={(revenueData._sum.amount || 0).toLocaleString()} />
        <StatCard title="گزارشات باز" value={reportsCount} highlight={reportsCount > 0} />
        <StatCard title="در انتظار تایید" value={pendingAds} highlight={pendingAds > 0} />
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="mb-4 font-semibold">نمودار درآمد</h2>
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}

// کامپوننت کمکی برای کارت‌ها (داخلی)
function StatCard({ title, value, highlight = false }: { title: string, value: number | string, highlight?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-red-500' : ''}`}>
        {value}
      </div>
    </div>
  );
}

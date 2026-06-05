export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"

export default async function AdminReports() {
  const reports = await prisma.report.findMany({
    include: {
      reporter: true,
      foodAd: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="p-6">
      <h1 className="text-xl mb-6">گزارشات کاربران</h1>
      <div className="space-y-4">
        {reports.map((r: any) => ( // اضافه کردن any یا تایپ صحیح برای رفع ارور
          <div key={r.id} className="border p-4 rounded">
            <p>آگهی: {r.foodAd?.foodName || "نامشخص"}</p>
            <p>گزارش دهنده: {r.reporter?.mobile}</p>
            <p>دلیل: {r.reason}</p>
            <p>توضیح: {r.description}</p>
            <p>وضعیت: {r.isResolved ? "رسیدگی شده" : "باز"}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

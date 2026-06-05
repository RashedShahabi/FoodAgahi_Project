import { prisma } from "@/lib/prisma";
import { approveAd, rejectAd } from "./actions";

export default async function AdsPage() {
  const ads = await prisma.foodAd.findMany({
    where: {
      status: "PENDING", // این مقدار باید با Enum در اسکیما منطبق باشد
    },
    include: {
      seller: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">مدیریت آگهی‌ها</h1>
      {ads.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-white dark:bg-gray-900 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400">آگهی‌ای برای نمایش وجود ندارد</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-right">غذا</th>
                <th className="p-3 text-right">فروشنده</th>
                <th className="p-3 text-right">قیمت</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-t">
                  <td className="p-3">{ad.foodName}</td>
                  <td className="p-3">{ad.seller.mobile}</td>
                  <td className="p-3">{ad.price}</td>
                  <td className="p-3 flex gap-2">
                    <form action={approveAd}>
                      <input type="hidden" name="id" value={ad.id} />
                      <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded text-xs">تایید</button>
                    </form>
                    <form action={rejectAd}>
                      <input type="hidden" name="id" value={ad.id} />
                      <button type="submit" className="bg-red-600 text-white px-2 py-1 rounded text-xs">رد</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { resolveDispute } from "./actions";

export default async function DisputesPage() {

  const disputes = await prisma.dispute.findMany({
    where: {
      isResolved: false,
    },
    include: {
      order: {
        include: {
          buyer: true,
          seller: true,
        },
      },
    },
  });

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold dark:text-white">
        حل اختلاف سفارش
      </h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 dark:bg-gray-800">

            <tr>
              <th className="p-3 text-right">خریدار</th>
              <th className="p-3 text-right">فروشنده</th>
              <th className="p-3 text-right">دلیل خریدار</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>

          </thead>

          <tbody>

            {disputes.map((d) => (

              <tr key={d.id} className="border-t">

                <td className="p-3">
                  {d.order.buyer.mobile}
                </td>

                <td className="p-3">
                  {d.order.seller.mobile}
                </td>

                <td className="p-3">
                  {d.buyerReason}
                </td>

                <td className="p-3 flex gap-2">

                  <form action={resolveDispute}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="winner" value="BUYER" />

                    <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      به نفع خریدار
                    </button>
                  </form>

                  <form action={resolveDispute}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="winner" value="SELLER" />

                    <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      به نفع فروشنده
                    </button>
                  </form>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

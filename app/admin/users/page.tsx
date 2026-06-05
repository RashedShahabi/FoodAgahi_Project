import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const where = search
    ? {
        phone: {
          contains: search,
        },
      }
    : {};

  const totalUsers = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">
          مدیریت کاربران
        </h1>

        <form className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="جستجو با شماره موبایل..."
            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            جستجو
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3 text-right">موبایل</th>
              <th className="p-3 text-right">نقش</th>
              <th className="p-3 text-right">تاریخ عضویت</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t dark:border-gray-800"
              >
                <td className="p-3">{user.phone}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            کاربری یافت نشد
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Link
            key={i}
            href={`?page=${i + 1}&search=${search}`}
            className={`px-3 py-1 rounded border text-sm ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { blockUser, deleteUser } from "./actions";

const PAGE_SIZE = 10;

// تعریف اینترفیس برای ورودی‌های صفحه
interface UsersPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // تبدیل ایمن مقادیر از searchParams
  const page = Number(searchParams?.page || 1);
  const search = searchParams?.search || "";

  const where = search
    ? {
        mobile: {
          contains: search,
          mode: 'insensitive' as const, // نادیده گرفتن کوچک/بزرگی حروف (اختیاری)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">مدیریت کاربران</h1>

        <form className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="جستجو با موبایل"
            className="border px-3 py-2 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            جستجو
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-4 text-right">موبایل</th>
              <th className="p-4 text-right">نقش</th>
              <th className="p-4 text-right">تاریخ عضویت</th>
              <th className="p-4 text-center">عملیات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  کاربری یافت نشد.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-medium">{user.mobile}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] ${
                      user.role === "ADMIN" 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {user.role === "ADMIN" ? "ادمین" : "دانشجو"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                      >
                        جزئیات
                      </Link>

                      <form action={blockUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs transition-colors">
                          بلاک
                        </button>
                      </form>

                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button 
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                          onClick={(e) => {
                            if(!confirm("آیا از حذف این کاربر مطمئن هستید؟")) e.preventDefault();
                          }}
                        >
                          حذف
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center py-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i}
              href={`?page=${i + 1}&search=${search}`}
              className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                page === i + 1 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

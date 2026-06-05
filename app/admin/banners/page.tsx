export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">مدیریت بنرها</h1>

      {banners.map((b) => (
        <div key={b.id} className="bg-white p-4 shadow rounded mb-4">
          <p>عنوان: {b.title}</p>
          <img src={b.imageUrl} alt="" className="w-48 h-auto mt-2" />
          <p>لینک: {b.link}</p>
        </div>
      ))}
    </div>
  );
}

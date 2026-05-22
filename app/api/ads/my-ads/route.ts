import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

/**
 * GET /api/ads/my-ads
 * لیست آگهی‌های کاربر فعلی (فروشنده)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const sellerId = session.user.id;

    const ads = await prisma.foodAd.findMany({
      where: {
        sellerId,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            id: true,
            status: true,
            buyerStudentId: true,
            transferScreenshot: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // فرمت پاسخ
    const formattedAds = ads.map((ad) => {
      // بررسی اینکه آیا سفارش فعالی وجود دارد
      const hasActiveOrders = ad.orders.length > 0;
      const canEditDelete = !hasActiveOrders && ad.isAvailable;

      return {
        id: ad.id,
        foodName: ad.foodName,
        price: ad.price,
        description: ad.description,
        imageUrl: ad.imageUrl,
        mealType: ad.mealType,
        mealDate: ad.mealDate.toISOString(),
        isAvailable: ad.isAvailable,
        isSold: ad.isSold,
        expiresAt: ad.expiresAt.toISOString(),
        createdAt: ad.createdAt.toISOString(),
        updatedAt: ad.updatedAt.toISOString(),
        hasActiveOrders,
        canEditDelete,
        orders: ad.orders.map(order => ({
          id: order.id,
          status: order.status,
          buyerStudentId: order.buyerStudentId,
          transferScreenshot: order.transferScreenshot,
        })),
      };
    });

    return NextResponse.json({ ads: formattedAds });
  } catch (error) {
    console.error("خطا در دریافت آگهی‌های من:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت آگهی‌ها رخ داد" },
      { status: 500 }
    );
  }
}
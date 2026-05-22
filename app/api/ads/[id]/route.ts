import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAdSchema = z.object({
  foodName: z.string().min(1, "نام غذا الزامی است").optional(),
  price: z
    .number()
    .positive("قیمت باید یک عدد مثبت باشد")
    .max(1000000, "قیمت نباید بیشتر از ۱,۰۰۰,۰۰۰ تومان باشد")
    .optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  mealType: z.enum(["LUNCH", "DINNER"]).optional(),
});

/**
 * PUT /api/ads/[id]
 * ویرایش آگهی
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const adId = params.id;
    const sellerId = session.user.id;

    // بررسی وجود آگهی
    const existingAd = await prisma.foodAd.findUnique({
      where: { id: adId },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });
    }

    // بررسی مالکیت آگهی
    if (existingAd.sellerId !== sellerId) {
      return NextResponse.json(
        { error: "شما مالک این آگهی نیستید" },
        { status: 403 }
      );
    }

    // بررسی اینکه آیا سفارش فعالی وجود دارد
    const activeOrders = await prisma.order.findFirst({
      where: {
        foodAdId: adId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (activeOrders) {
      return NextResponse.json(
        { error: "آگهی دارای سفارش فعال است و قابل ویرایش نمی‌باشد" },
        { status: 400 }
      );
    }

    // بررسی موجود بودن آگهی
    if (!existingAd.isAvailable) {
      return NextResponse.json(
        { error: "آگهی غیرموجود یا فروخته شده است و قابل ویرایش نمی‌باشد" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateAdSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: "حداقل یک فیلد برای ویرایش وارد کنید" },
        { status: 400 }
      );
    }

    // بررسی سقف مجاز قیمت
    const priceToCheck = validatedData.price ?? existingAd.price;
    const maxPrice = 50000 * 2;
    if (priceToCheck > maxPrice) {
      return NextResponse.json(
        { error: `قیمت نمی‌تواند بیشتر از ${maxPrice.toLocaleString()} تومان باشد` },
        { status: 400 }
      );
    }

    // بررسی محدودیت زمان اگر وعده تغییر کرده
    if (validatedData.mealType) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      if (validatedData.mealType === "LUNCH" && currentTimeInMinutes > 13 * 60 + 30) {
        return NextResponse.json(
          { error: "زمان ثبت آگهی ناهار تمام شده است (آخرین مهلت 13:30)" },
          { status: 400 }
        );
      }
      if (validatedData.mealType === "DINNER" && currentTimeInMinutes > 18 * 60 + 30) {
        return NextResponse.json(
          { error: "زمان ثبت آگهی شام تمام شده است (آخرین مهلت 18:30)" },
          { status: 400 }
        );
      }

      // محاسبه زمان انقضای جدید
      const mealDateTime = existingAd.mealDate;
      let newExpiresAt: Date;
      if (validatedData.mealType === "LUNCH") {
        newExpiresAt = new Date(mealDateTime);
        newExpiresAt.setHours(14, 0, 0, 0);
      } else {
        newExpiresAt = new Date(mealDateTime);
        newExpiresAt.setHours(19, 0, 0, 0);
      }
      // @ts-ignore - expiresAt needs to be added dynamically
      const updatedData = { ...validatedData, expiresAt: newExpiresAt };
      validatedData as typeof updatedData;
    }

    // ویرایش آگهی
    const ad = await prisma.foodAd.update({
      where: { id: adId },
      data: validatedData,
    });

    return NextResponse.json({
      message: "آگهی با موفقیت ویرایش شد",
      ad: {
        id: ad.id,
        foodName: ad.foodName,
        price: ad.price,
        mealType: ad.mealType,
        isAvailable: ad.isAvailable,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("خطا در ویرایش آگهی:", error);
    return NextResponse.json(
      { error: "خطایی در ویرایش آگهی رخ داد" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ads/[id]
 * حذف آگهی
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const adId = params.id;
    const sellerId = session.user.id;

    // بررسی وجود آگهی
    const existingAd = await prisma.foodAd.findUnique({
      where: { id: adId },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });
    }

    // بررسی مالکیت آگهی
    if (existingAd.sellerId !== sellerId) {
      return NextResponse.json(
        { error: "شما مالک این آگهی نیستید" },
        { status: 403 }
      );
    }

    // بررسی اینکه آیا سفارش فعالی وجود دارد
    const activeOrders = await prisma.order.findFirst({
      where: {
        foodAdId: adId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (activeOrders) {
      return NextResponse.json(
        { error: "آگهی دارای سفارش فعال است و قابل حذف نمی‌باشد" },
        { status: 400 }
      );
    }

    // حذف منطقی: غیرموجود کردن آگهی
    await prisma.foodAd.update({
      where: { id: adId },
      data: {
        isAvailable: false,
      },
    });

    return NextResponse.json({
      message: "آگهی با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("خطا در حذف آگهی:", error);
    return NextResponse.json(
      { error: "خطایی در حذف آگهی رخ داد" },
      { status: 500 }
    );
  }
}
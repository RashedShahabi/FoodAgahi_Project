import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { toJalaali, toGregorian } from "jalaali-js";

const createAdSchema = z.object({
  foodName: z.string().min(1, "نام غذا الزامی است"),
  price: z
    .number()
    .positive("قیمت باید یک عدد مثبت باشد")
    .max(1000000, "قیمت نباید بیشتر از ۱,۰۰۰,۰۰۰ تومان باشد"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  mealType: z.enum(["LUNCH", "DINNER"]),
  mealDate: z.string().min(1, "تاریخ وعده الزامی است"),
});

/**
 * Helper: Convert Jalaali date string (YYYY-MM-DD) to Date object at start of day
 */
function jalaaliToDateStartOfDay(jalaaliDateStr: string): Date {
  const [year, month, day] = jalaaliDateStr.split("-").map(Number);
  // Convert Jalaali to Gregorian
  const gregorian = toGregorian(year, month, day);
  // Create Date object at start of day (UTC)
  return new Date(Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd));
}

/**
 * Get current time in Iran timezone (UTC+3:30)
 */
function getIranTime(): Date {
  const utcNow = Date.now();
  const iranOffset = 3.5 * 60 * 60 * 1000; // 3.5 hours in milliseconds
  return new Date(utcNow + iranOffset);
}

/**
 * Get today's date in Jalaali format (YYYY-MM-DD)
 */
function getTodayJalaaliDate(): string {
  const iranTime = getIranTime();
  const jDate = toJalaali(iranTime);
  const year = jDate.jy.toString();
  const month = jDate.jm.toString().padStart(2, "0");
  const day = jDate.jd.toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * POST /api/ads
 * ثبت آگهی جدید غذا
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const body = await request.json();
    const { foodName, price, description, imageUrl, mealType, mealDate } =
      createAdSchema.parse(body);

    const sellerId = session.user.id;

    // تبدیل تاریخ خورشیدی به میلادی برای ذخیره در دیتابیس
    const mealDateObj = jalaaliToDateStartOfDay(mealDate);
    
    // بررسی محدودیت زمان ثبت آگهی بر اساس زمان ایران
    const iranTime = getIranTime();
    const jToday = getTodayJalaaliDate();
    const currentHour = iranTime.getHours();
    const currentMinute = iranTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // اگر تاریخ وعده امروز (شمسی) است، محدودیت زمانی اعمال شود
    // تبدیل تاریخ وارد شده به فرمت قابل مقایسه با jToday
    const mealDateParts = mealDate.split("-").map(Number);
    const mealJalaali = `${mealDateParts[0]}-${mealDateParts[1].toString().padStart(2, "0")}-${mealDateParts[2].toString().padStart(2, "0")}`;
    
    if (mealJalaali === jToday) {
      // امروز - اعمال محدودیت زمانی
      if (mealType === "LUNCH") {
        // برای ناهار تا ساعت 13:30
        const limitTime = 13 * 60 + 30;
        if (currentTimeInMinutes > limitTime) {
          return NextResponse.json(
            { error: "زمان ثبت آگهی ناهار تمام شده است (آخرین مهلت ۱۳:۳۰)" },
            { status: 400 }
          );
        }
      } else if (mealType === "DINNER") {
        // برای شام تا ساعت 18:30
        const limitTime = 18 * 60 + 30;
        if (currentTimeInMinutes > limitTime) {
          return NextResponse.json(
            { error: "زمان ثبت آگهی شام تمام شده است (آخرین مهلت ۱۸:۳۰)" },
            { status: 400 }
          );
        }
      }
    }

    // بررسی سقف مجاز قیمت (حداکثر 2 برابر قیمت دانشگاه - فرضاٌ 50000 تومان)
    const maxPrice = 50000 * 2;
    if (price > maxPrice) {
      return NextResponse.json(
        { error: `قیمت نمی‌تواند بیشتر از ${maxPrice.toLocaleString()} تومان باشد` },
        { status: 400 }
      );
    }

    // تعیین زمان انقضا بر اساس وعده
    let expiresAt: Date;
    if (mealType === "LUNCH") {
      // آگهی ناهار تا 14:00 معتبر است
      expiresAt = new Date(mealDateObj);
      expiresAt.setUTCHours(14, 0, 0, 0);
    } else {
      // آگهی شام تا 19:00 معتبر است
      expiresAt = new Date(mealDateObj);
      expiresAt.setUTCHours(19, 0, 0, 0);
    }

    // اگر الان از زمان انقضا جلوتر است، آگهی منقضی است
    if (expiresAt <= iranTime) {
      return NextResponse.json(
        { error: "تاریخ وعده باید در آینده باشد" },
        { status: 400 }
      );
    }

    // ثبت آگهی
    const ad = await prisma.foodAd.create({
      data: {
        sellerId,
        foodName,
        price,
        description: description || null,
        imageUrl: imageUrl || null,
        mealType,
        mealDate: mealDateObj,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        message: "آگهی با موفقیت ثبت شد",
        ad: {
          id: ad.id,
          foodName: ad.foodName,
          price: ad.price,
          mealType: ad.mealType,
          isAvailable: ad.isAvailable,
          mealDate: ad.mealDate.toISOString(),
          expiresAt: ad.expiresAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("خطا در ثبت آگهی:", error);
    return NextResponse.json(
      { error: "خطایی در ثبت آگهی رخ داد" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ads
 * لیست آگهی‌های عمومی (برای خریدار)
 * با فیلتر و پشتیبانی Short-Polling
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mealType = searchParams.get("mealType");
    const mealDate = searchParams.get("mealDate");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {
      isAvailable: true,
      isSold: false,
    };

    // فیلتر وعده غذایی
    if (mealType && (mealType === "LUNCH" || mealType === "DINNER")) {
      where.mealType = mealType;
    }

    // فیلتر تاریخ
    if (mealDate) {
      const dateStart = new Date(mealDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(mealDate);
      dateEnd.setHours(23, 59, 59, 999);
      where.mealDate = {
        gte: dateStart,
        lte: dateEnd,
      };
    }

    // جستجو بر اساس نام غذا
    if (search) {
      where.foodName = {
        contains: search,
        mode: "insensitive",
      };
    }

    // حذف آگهی‌های منقضی شده
    where.expiresAt = {
      gt: new Date(),
    };

    const ads = await prisma.foodAd.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            mobile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // محدودیت برای کارایی
    });

    // فرمت پاسخ
    const formattedAds = ads.map((ad) => ({
      id: ad.id,
      foodName: ad.foodName,
      price: ad.price,
      description: ad.description,
      imageUrl: ad.imageUrl,
      mealType: ad.mealType,
      mealDate: ad.mealDate.toISOString(),
      sellerId: ad.sellerId,
      sellerMobile: ad.seller.mobile,
      expiresAt: ad.expiresAt.toISOString(),
      createdAt: ad.createdAt.toISOString(),
    }));

    return NextResponse.json({ ads: formattedAds });
  } catch (error) {
    console.error("خطا در دریافت لیست آگهی‌ها:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت لیست آگهی‌ها رخ داد" },
      { status: 500 }
    );
  }
}
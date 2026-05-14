import { NextResponse } from "next/server";

/**
 * نوع غذای دانشگاه
 */
interface MenuItem {
  id: string;
  name: string;
  price: number;
  mealType: string;
}

/**
 * منوی غذاهای دانشگاه
 * هر غذا شامل نام، قیمت پایه و نوع وعده است
 */
const MENU_ITEMS: MenuItem[] = [
  // ناهارها
  {
    id: "lunch-1",
    name: "چلو خورشت قورمه سبزی",
    price: 30000,
    mealType: "LUNCH",
  },
  {
    id: "lunch-2",
    name: "چلو خورشت قیمه",
    price: 30000,
    mealType: "LUNCH",
  },
  {
    id: "lunch-3",
    name: "زرشک پلو با مرغ",
    price: 35000,
    mealType: "LUNCH",
  },
  {
    id: "lunch-4",
    name: "چلو جوجه کباب",
    price: 35000,
    mealType: "LUNCH",
  },
  {
    id: "lunch-5",
    name: "چلو کباب کوبیده",
    price: 40000,
    mealType: "LUNCH",
  },
  // شام‌ها
  {
    id: "dinner-1",
    name: "آش رشته",
    price: 25000,
    mealType: "DINNER",
  },
  {
    id: "dinner-2",
    name: "خورشت کدو",
    price: 25000,
    mealType: "DINNER",
  },
  {
    id: "dinner-3",
    name: "زرشک پلو با مرغ",
    price: 30000,
    mealType: "DINNER",
  },
  {
    id: "dinner-4",
    name: "املت گوجه",
    price: 15000,
    mealType: "DINNER",
  },
  {
    id: "dinner-5",
    name: "ساندویچ مرغ",
    price: 20000,
    mealType: "DINNER",
  },
];

/**
 * GET /api/menu
 * دریافت لیست غذاهای موجود بر اساس نوع وعده
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mealType = searchParams.get("mealType");

    if (mealType && (mealType === "LUNCH" || mealType === "DINNER")) {
      const filtered = MENU_ITEMS.filter((item) => item.mealType === mealType);
      return NextResponse.json({ items: filtered });
    }

    return NextResponse.json({ items: MENU_ITEMS });
  } catch (error) {
    console.error("خطا در دریافت منو:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت منو رخ داد" },
      { status: 500 }
    );
  }
}
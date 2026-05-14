import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = sendOtpSchema.parse(body);

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return NextResponse.json(
        { error: "کاربری با این شماره موبایل یافت نشد" },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "حساب کاربری شما غیرفعال است" },
        { status: 403 }
      );
    }

    // تولید کد 6 رقمی
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ذخیره کد OTP با اعتبار 2 دقیقه
    await prisma.otpCode.create({
      data: {
        mobile,
        code,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 دقیقه
        userId: user.id,
      },
    });

    // چاپ کد در Console سرور (به جای ارسال پیامک)
    console.log("=".repeat(50));
    console.log(`کد ورود برای ${mobile}: ${code}`);
    console.log("=".repeat(50));

    return NextResponse.json({
      message: "کد تایید ارسال شد",
      mobile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("خطا در ارسال کد:", error);
    return NextResponse.json(
      { error: "خطایی در ارسال کد رخ داد" },
      { status: 500 }
    );
  }
}

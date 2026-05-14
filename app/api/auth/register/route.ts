import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  mobile: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل 8 کاراکتر باشد")
    .regex(/[A-Za-z]/, "رمز عبور باید حداقل یک حرف داشته باشد")
    .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد"),
});

const verifyOtpSchema = z.object({
  mobile: z.string(),
  code: z.string().length(6, "کد تایید باید 6 رقم باشد"),
  password: z.string(),
});

// مرحله 1: ارسال درخواست ثبت نام و تولید OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, password } = registerSchema.parse(body);

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { mobile },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربری با این شماره موبایل قبلاً ثبت نام کرده است" },
        { status: 400 }
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
      },
    });

    // چاپ کد در Console سرور (به جای ارسال پیامک)
    console.log("=".repeat(50));
    console.log(`کد تایید برای ${mobile}: ${code}`);
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

    console.error("خطا در ثبت نام:", error);
    return NextResponse.json(
      { error: "خطایی در ثبت نام رخ داد" },
      { status: 500 }
    );
  }
}

// مرحله 2: تایید OTP، ایجاد کاربر و ورود خودکار
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, code, password } = verifyOtpSchema.parse(body);

    // بررسی کد OTP
    const otpCode = await prisma.otpCode.findFirst({
      where: {
        mobile,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpCode) {
      return NextResponse.json(
        { error: "کد تایید نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    // بررسی مجدد وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { mobile },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربری با این شماره موبایل قبلاً ثبت نام کرده است" },
        { status: 400 }
      );
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ایجاد کاربر
    const user = await prisma.user.create({
      data: {
        mobile,
        password: hashedPassword,
      },
    });

    // علامت‌گذاری کد به عنوان استفاده شده
    await prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { isUsed: true },
    });

    // در اینجا صرفاً کاربر ایجاد می‌شود و صفحه سمت کلاینت
    // کاربر را به صفحه ورود هدایت می‌کند تا خودش وارد شود
    return NextResponse.json({
      message: "ثبت نام با موفقیت انجام شد",
      user: {
        id: user.id,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("خطا در تایید کد:", error);
    return NextResponse.json(
      { error: "خطایی در تایید کد رخ داد" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

// GET - بررسی تکمیل بودن پروفایل کاربر
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "لطفاً وارد شوید" },
        { status: 401 }
      );
    }

    // دریافت اطلاعات کاربر همراه با شماره دانشجویی و شبا
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentIds: true,
        ibans: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی تکمیل بودن پروفایل
    // پروفایل زمانی تکمیل شده است که کاربر حداقل شماره دانشجویی و شبا داشته باشد
    const hasStudentId = user.studentIds.length > 0;
    const hasIban = user.ibans.length > 0;
    const isComplete = hasStudentId && hasIban;

    // اطلاعات پیام‌های هشدار
    const messages: string[] = [];
    if (!hasStudentId) {
      messages.push("شماره دانشجویی خود را ثبت کنید");
    }
    if (!hasIban) {
      messages.push("شماره شبا خود را ثبت کنید");
    }

    return NextResponse.json({
      isComplete,
      hasStudentId,
      hasIban,
      messages,
      remainingSteps: (hasStudentId ? 0 : 1) + (hasIban ? 0 : 1),
    });
  } catch (error) {
    console.error("خطا در بررسی تکمیل بودن پروفایل:", error);
    return NextResponse.json(
      { error: "خطایی در سرور رخ داد" },
      { status: 500 }
    );
  }
}
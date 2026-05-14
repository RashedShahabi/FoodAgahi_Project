import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const { newMobile, otpCode } = await req.json()

    // Validate mobile format
    if (!newMobile || !/^09\d{9}$/.test(newMobile)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      )
    }

    if (!otpCode || otpCode.length !== 6) {
      return NextResponse.json(
        { error: "کد تایید نامعتبر است" },
        { status: 400 }
      )
    }

    // Verify OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        mobile: newMobile,
        code: otpCode,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "کد تایید نامعتبر یا منقضی شده است" },
        { status: 400 }
      )
    }

    // Check if new mobile is already in use
    const existingUser = await prisma.user.findUnique({
      where: { mobile: newMobile },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // Update user's mobile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mobile: newMobile },
    })

    // Delete used OTP
    await prisma.otpCode.delete({
      where: { id: otpRecord.id },
    })

    return NextResponse.json({
      success: true,
      message: "شماره موبایل با موفقیت تغییر یافت",
    })
  } catch (error) {
    console.error("Change mobile error:", error)
    return NextResponse.json(
      { error: "خطا در تغییر شماره موبایل" },
      { status: 500 }
    )
  }
}

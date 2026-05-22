import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentIds: {
          select: {
            id: true,
            studentNumber: true,
          },
        },
        ibans: {
          select: {
            id: true,
            ibanNumber: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({
      mobile: user.mobile,
      balance: user.balance,
      studentIds: user.studentIds,
      ibans: user.ibans,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات پروفایل" },
      { status: 500 }
    )
  }
}

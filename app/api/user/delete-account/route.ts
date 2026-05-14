import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    // Check if user has active orders
    const activeOrders = await prisma.order.findFirst({
      where: {
        buyerId: session.user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    })

    if (activeOrders) {
      return NextResponse.json(
        {
          error:
            "شما نمی‌توانید حساب خود را حذف کنید زیرا سفارش‌های در جریان دارید",
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    // Check if user has wallet balance
    if (user.balance > 0) {
      return NextResponse.json(
        {
          error:
            "شما نمی‌توانید حساب خود را حذف کنید زیرا موجودی کیف پول دارید. لطفاً ابتدا موجودی خود را برداشت کنید",
        },
        { status: 400 }
      )
    }

    // Soft delete: set is_active to false
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: "حساب کاربری با موفقیت حذف شد",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "خطا در حذف حساب کاربری" },
      { status: 500 }
    )
  }
}
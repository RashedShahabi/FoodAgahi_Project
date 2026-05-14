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

    const { ibanNumber } = await req.json()

    // Validate IBAN format (IR + 24 digits)
    if (!ibanNumber || !/^IR\d{24}$/.test(ibanNumber)) {
      return NextResponse.json(
        { error: "شماره شبا باید با IR شروع شده و 26 کاراکتر (IR + 24 رقم) داشته باشد" },
        { status: 400 }
      )
    }

    // Check if IBAN already exists for this user
    const existing = await prisma.iban.findFirst({
      where: {
        userId: session.user.id,
        ibanNumber,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "این شماره شبا قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    const ibanRecord = await prisma.iban.create({
      data: {
        userId: session.user.id,
        ibanNumber,
      },
    })

    return NextResponse.json({
      success: true,
      iban: {
        id: ibanRecord.id,
        ibanNumber: ibanRecord.ibanNumber,
      },
    })
  } catch (error) {
    console.error("Add IBAN error:", error)
    return NextResponse.json(
      { error: "خطا در افزودن شماره شبا" },
      { status: 500 }
    )
  }
}

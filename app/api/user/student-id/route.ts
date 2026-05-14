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

    const { studentNumber } = await req.json()

    if (!studentNumber || !/^\d+$/.test(studentNumber)) {
      return NextResponse.json(
        { error: "شماره دانشجویی نامعتبر است" },
        { status: 400 }
      )
    }

    // Check if student number already exists for this user
    const existing = await prisma.studentId.findFirst({
      where: {
        userId: session.user.id,
        studentNumber,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "این شماره دانشجویی قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    const studentId = await prisma.studentId.create({
      data: {
        userId: session.user.id,
        studentNumber,
      },
    })

    return NextResponse.json({
      success: true,
      studentId: {
        id: studentId.id,
        studentNumber: studentId.studentNumber,
      },
    })
  } catch (error) {
    console.error("Add student ID error:", error)
    return NextResponse.json(
      { error: "خطا در افزودن شماره دانشجویی" },
      { status: 500 }
    )
  }
}

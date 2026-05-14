import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const { id } = params

    // Verify the student ID belongs to the current user
    const studentId = await prisma.studentId.findUnique({
      where: { id },
    })

    if (!studentId) {
      return NextResponse.json(
        { error: "شماره دانشجویی یافت نشد" },
        { status: 404 }
      )
    }

    if (studentId.userId !== session.user.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    await prisma.studentId.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete student ID error:", error)
    return NextResponse.json(
      { error: "خطا در حذف شماره دانشجویی" },
      { status: 500 }
    )
  }
}

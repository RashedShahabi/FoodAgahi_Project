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

    // Verify the IBAN belongs to the current user
    const iban = await prisma.iban.findUnique({
      where: { id },
    })

    if (!iban) {
      return NextResponse.json(
        { error: "شماره شبا یافت نشد" },
        { status: 404 }
      )
    }

    if (iban.userId !== session.user.id) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    await prisma.iban.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete IBAN error:", error)
    return NextResponse.json(
      { error: "خطا در حذف شماره شبا" },
      { status: 500 }
    )
  }
}

"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function reportAd(formData: FormData) {
  const reporterId = formData.get("reporterId") as string
  const foodAdId = formData.get("foodAdId") as string
  const reason = formData.get("reason") as string
  const description = formData.get("description") as string | null

  if (!reporterId || !foodAdId || !reason) {
    throw new Error("اطلاعات گزارش ناقص است")
  }

  await prisma.report.create({
    data: {
      reporterId,
      foodAdId,
      reason,
      description: description || null,
    },
  })

  revalidatePath("/")
}

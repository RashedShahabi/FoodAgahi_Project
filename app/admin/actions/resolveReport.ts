"use server"

import { prisma } from "@/lib/prisma"

export async function resolveReport(id: string) {
  await prisma.report.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date()
    }
  })
}

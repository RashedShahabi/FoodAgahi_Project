"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resolveReport(formData: FormData) {

  const id = formData.get("id") as string;

  await prisma.report.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });

  revalidatePath("/admin/reports");
}

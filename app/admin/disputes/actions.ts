"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resolveDispute(formData: FormData) {
  const id = formData.get("id") as string;
  const winner = formData.get("winner") as string;

  if (!id) return;

  try {
    await prisma.dispute.update({
      where: { id: id },
      data: {
        isResolved: true,
        resolvedInFavorOf: winner,
        resolvedAt: new Date(),
      },
    });

    revalidatePath("/admin/disputes");
  } catch (error) {
    console.error("Failed to resolve dispute:", error);
  }
}

export {};

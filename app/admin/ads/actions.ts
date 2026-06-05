"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveAd(formData: FormData) {

  const id = formData.get("id") as string;

  await prisma.foodAd.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin/ads");
}

export async function rejectAd(formData: FormData) {

  const id = formData.get("id") as string;

  await prisma.foodAd.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/ads");
}

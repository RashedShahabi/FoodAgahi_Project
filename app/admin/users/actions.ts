"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function blockUser(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/users");
}

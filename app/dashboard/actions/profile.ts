"use server";

import { prisma } from "../../../lib/prisma"; 
import { getServerSession } from "next-auth"; 
import { authOptions } from "../../../lib/auth";   
export async function getProfileCompletion() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) return 0;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentIds: true,
        ibans: true,
      }
    });

    if (!user) return 0;

    let score = 0;
    // محاسبه امتیاز
    if (user.mobile) score += 25; 
    if (user.studentIds && user.studentIds.length > 0) score += 35;
    if (user.ibans && user.ibans.length > 0) score += 40;

    return score;
  } catch (error) {
    console.error("خطا در محاسبه درصد پروفایل:", error);
    return 0;
  }
}

"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const getCurrentUser = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    const currUsr = await db.user.findUnique({
      where: { clerkUserId: user.id },
      select: {
        id: true,
        role: true,
        name: true,
        title: true,
        company: true,
        imageUrl: true,
      },
    });
    return currUsr
  } catch (error) {
    throw new Error(error);
  }
};
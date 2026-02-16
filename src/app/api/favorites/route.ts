import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { toolId } = await request.json();

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_toolId: {
        userId: session.user.id,
        toolId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFavorite: false });
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      toolId,
    },
  });

  return NextResponse.json({ isFavorite: true });
}

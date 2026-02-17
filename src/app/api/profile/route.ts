import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trakaWebUrl: true },
  });

  return NextResponse.json({ trakaWebUrl: user?.trakaWebUrl || "" });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      trakaWebUrl: body.trakaWebUrl || null,
    },
    select: { trakaWebUrl: true },
  });

  return NextResponse.json({ trakaWebUrl: updated.trakaWebUrl || "" });
}

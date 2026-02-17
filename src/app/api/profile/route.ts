import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      trakaWebUrl: true,
      rdpHost: true,
      rdpUsername: true,
      rdpPassword: true,
    },
  });

  return NextResponse.json({
    trakaWebUrl: user?.trakaWebUrl || "",
    rdpHost: user?.rdpHost || "",
    rdpUsername: user?.rdpUsername || "",
    rdpPasswordSet: !!user?.rdpPassword,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Build update data
  const data: Record<string, string | null> = {};

  // Handle TrakaWEB URL (always update if present in body)
  if ("trakaWebUrl" in body) {
    data.trakaWebUrl = body.trakaWebUrl || null;
  }

  // Handle RDP fields
  if ("rdpHost" in body) {
    data.rdpHost = body.rdpHost || null;
  }
  if ("rdpUsername" in body) {
    data.rdpUsername = body.rdpUsername || null;
  }
  if ("rdpPassword" in body && body.rdpPassword) {
    data.rdpPassword = encrypt(body.rdpPassword);
  } else if ("rdpPassword" in body && !body.rdpPassword) {
    data.rdpPassword = null;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      trakaWebUrl: true,
      rdpHost: true,
      rdpUsername: true,
      rdpPassword: true,
    },
  });

  return NextResponse.json({
    trakaWebUrl: updated.trakaWebUrl || "",
    rdpHost: updated.rdpHost || "",
    rdpUsername: updated.rdpUsername || "",
    rdpPasswordSet: !!updated.rdpPassword,
  });
}

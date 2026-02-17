import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

const VALID_ROLES = ["ADMIN", "APP_SUPPORT", "EU_TECH_SUPPORT", "UK_TECH_SUPPORT"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Don't allow demoting yourself
  if (id === session.user.id && body.role && body.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  // Validate role if provided
  if (body.role && !VALID_ROLES.includes(body.role)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  // Build update data
  const data: Record<string, unknown> = {};

  if ("role" in body) data.role = body.role;
  if ("isActive" in body) data.isActive = body.isActive;
  if ("isApproved" in body) data.isApproved = body.isApproved;
  if ("rdpHost" in body) data.rdpHost = body.rdpHost || null;
  if ("rdpUsername" in body) data.rdpUsername = body.rdpUsername || null;
  if ("rdpPassword" in body && body.rdpPassword) {
    data.rdpPassword = encrypt(body.rdpPassword);
  } else if ("rdpPassword" in body && !body.rdpPassword) {
    data.rdpPassword = null;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isApproved: true,
        rdpHost: true,
        rdpUsername: true,
        rdpPassword: true,
      },
    });
    return NextResponse.json({
      ...user,
      rdpPasswordSet: !!user.rdpPassword,
      rdpPassword: undefined,
    });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Default settings created on first access (no seed script required)
const DEFAULT_SETTINGS = [
  {
    key: "session_timeout_hours",
    value: "8",
    label: "Session Timeout (hours)",
    description:
      "How long users stay logged in. Changes apply to new logins only — existing sessions keep their original timeout.",
    type: "number",
  },
];

async function ensureDefaults() {
  for (const s of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
}

// GET /api/settings — returns all settings (admin only)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDefaults();
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(settings);
}

// PUT /api/settings — update a single setting by key (admin only)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || value === undefined || value === null) {
    return NextResponse.json(
      { error: "Missing key or value" },
      { status: 400 }
    );
  }

  // Validate numeric fields
  if (key === "session_timeout_hours") {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 8760) {
      return NextResponse.json(
        { error: "Session timeout must be between 1 and 8760 hours" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.setting.update({
    where: { key },
    data: {
      value: String(value),
      updatedBy: session.user.id,
    },
  });

  return NextResponse.json(updated);
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role;
  const isAdmin = userRole === "ADMIN";

  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    include: {
      favorites: {
        where: { userId: session.user.id },
      },
      _count: {
        select: { toolLaunches: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Filter tools based on role permissions
  // ADMIN can always see everything
  // If allowedRoles is null/empty, the tool is visible to all roles
  // Otherwise, only roles listed in allowedRoles can see the tool
  const visibleTools = isAdmin
    ? tools
    : tools.filter((tool) => {
        if (!tool.allowedRoles) return true;
        const allowed = tool.allowedRoles.split(",").map((r) => r.trim());
        return allowed.includes(userRole);
      });

  const toolsWithFavorites = visibleTools.map((tool) => ({
    ...tool,
    isFavorite: tool.favorites.length > 0,
    launchCount: tool._count.toolLaunches,
    favorites: undefined,
    _count: undefined,
  }));

  return NextResponse.json(toolsWithFavorites);
}

const createToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().default("wrench"),
  launchUrl: z.string().nullable().optional(),
  launchType: z.enum(["WEB", "DESKTOP", "PROTOCOL"]).default("WEB"),
  category: z.string().default("General"),
  version: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
  allowedRoles: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createToolSchema.parse(body);

    const tool = await prisma.tool.create({ data });
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

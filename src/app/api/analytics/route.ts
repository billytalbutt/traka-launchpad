import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total launches
  const totalLaunches = await prisma.toolLaunch.count();

  // Launches last 7 days
  const recentLaunches = await prisma.toolLaunch.count({
    where: { launchedAt: { gte: sevenDaysAgo } },
  });

  // Total users
  const totalUsers = await prisma.user.count();

  // Active users (launched something in last 7 days)
  const activeUsers = await prisma.toolLaunch.findMany({
    where: { launchedAt: { gte: sevenDaysAgo } },
    distinct: ["userId"],
    select: { userId: true },
  });

  // Most popular tools
  const toolLaunches = await prisma.toolLaunch.groupBy({
    by: ["toolId"],
    _count: { toolId: true },
    orderBy: { _count: { toolId: "desc" } },
    take: 10,
  });

  const toolIds = toolLaunches.map((t) => t.toolId);
  const tools = await prisma.tool.findMany({
    where: { id: { in: toolIds } },
  });

  const popularTools = toolLaunches.map((tl) => {
    const tool = tools.find((t) => t.id === tl.toolId);
    return {
      name: tool?.name || "Unknown",
      launches: tl._count.toolId,
      color: tool?.color || "#0078D4",
    };
  });

  // Daily launches for last 30 days
  const dailyLaunches = await prisma.toolLaunch.findMany({
    where: { launchedAt: { gte: thirtyDaysAgo } },
    select: { launchedAt: true },
    orderBy: { launchedAt: "asc" },
  });

  const dailyData: Record<string, number> = {};
  dailyLaunches.forEach((launch) => {
    const day = launch.launchedAt.toISOString().split("T")[0];
    dailyData[day] = (dailyData[day] || 0) + 1;
  });

  const chartData = Object.entries(dailyData).map(([date, count]) => ({
    date,
    launches: count,
  }));

  // Recent launches
  const recentActivity = await prisma.toolLaunch.findMany({
    take: 20,
    orderBy: { launchedAt: "desc" },
    include: {
      user: { select: { name: true, email: true, image: true } },
      tool: { select: { name: true, iconName: true, color: true } },
    },
  });

  return NextResponse.json({
    totalLaunches,
    recentLaunches,
    totalUsers,
    activeUsers: activeUsers.length,
    popularTools,
    chartData,
    recentActivity,
  });
}

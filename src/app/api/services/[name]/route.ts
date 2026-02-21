import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getServiceConfig,
  getServiceStatus,
  getServiceLogs,
} from "@/lib/windows-services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await params;
  const config = getServiceConfig(name);
  if (!config) {
    return NextResponse.json({ error: "Service not configured" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const includeLogs = searchParams.get("logs") === "true";

  try {
    const [status, logs] = await Promise.all([
      getServiceStatus(config.name),
      includeLogs
        ? getServiceLogs(config.name, config.displayName)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      config,
      status: status.status,
      displayNameFromWindows: status.displayName,
      startType: status.startType,
      exists: status.exists,
      logs: logs ?? undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

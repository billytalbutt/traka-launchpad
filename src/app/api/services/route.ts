import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getServiceConfigs,
  getAllServicesStatus,
} from "@/lib/windows-services";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const configs = getServiceConfigs();
    const statuses = await getAllServicesStatus();

    const result = configs.map((config) => {
      const state = statuses.find(
        (s) => s.name.toLowerCase() === config.name.toLowerCase()
      );
      return {
        ...config,
        status: state?.status ?? "Error",
        displayNameFromWindows: state?.displayName ?? config.displayName,
        startType: state?.startType ?? "",
        exists: state?.exists ?? false,
        error: state?.error ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getServiceConfig,
  performServiceAction,
  type ServiceAction,
} from "@/lib/windows-services";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["start", "stop", "restart"]),
});

export async function POST(
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

  try {
    const body = await request.json();
    const { action } = actionSchema.parse(body);
    const result = await performServiceAction(config.name, action as ServiceAction);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, action, service: config.name });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

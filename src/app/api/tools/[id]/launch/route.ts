import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { spawn, execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

function spawnHidden(command: string, args: string[], cwd: string) {
  spawn(command, args, {
    cwd,
    stdio: "ignore",
    windowsHide: true,
    shell: true,
  }).unref();
}

function openUrl(url: string) {
  spawn("cmd.exe", ["/c", "start", "", url], {
    stdio: "ignore",
    windowsHide: true,
  }).unref();
}

function launchDocsAssistant(projectPath: string) {
  const backendPath = path.join(projectPath, "backend");
  const frontendPath = path.join(projectPath, "frontend");

  if (existsSync(path.join(backendPath, "main.py"))) {
    spawnHidden("python", ["main.py"], backendPath);
  }

  setTimeout(() => {
    if (existsSync(frontendPath)) {
      spawnHidden("npm", ["run", "dev"], frontendPath);
    }
  }, 2000);

  setTimeout(() => {
    openUrl("https://docs.traka.test/admin");
  }, 6000);
}

function launchRdpSession(host: string, username: string, password: string) {
  // Store credentials silently using cmdkey
  execSync(
    `cmdkey /generic:TERMSRV/${host} /user:${username} /pass:${password}`,
    { windowsHide: true, stdio: "ignore" }
  );

  spawn("mstsc", ["/v:" + host], {
    stdio: "ignore",
    windowsHide: true,
  }).unref();
}

function launchDocsAssistantDashboard(projectPath: string) {
  const backendPath = path.join(projectPath, "backend");
  const frontendPath = path.join(projectPath, "frontend");

  if (existsSync(path.join(backendPath, "app.py"))) {
    spawnHidden("py", ["-3.12", "app.py"], backendPath);
  }

  setTimeout(() => {
    if (existsSync(frontendPath)) {
      spawnHidden("npm", ["run", "dev"], frontendPath);
    }
  }, 3000);

  setTimeout(() => {
    openUrl("http://localhost:4200");
  }, 8000);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const tool = await prisma.tool.findUnique({ where: { id } });
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    let effectiveLaunchUrl = tool.launchUrl;

    // For TrakaWEB, use the user's custom URL if they have one set
    if (tool.name === "TrakaWEB") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user?.trakaWebUrl) {
        effectiveLaunchUrl = user.trakaWebUrl;
      }
    }

    // For My VM, launch an RDP session with the user's configured credentials
    if (tool.name === "My VM") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { rdpHost: true, rdpUsername: true, rdpPassword: true },
      });

      if (!user?.rdpHost || !user?.rdpUsername || !user?.rdpPassword) {
        return NextResponse.json({
          message: "Launch failed",
          launchType: tool.launchType,
          desktopStatus: "error",
          error:
            "RDP not configured. Go to your Profile page to set your VM hostname, username, and password.",
        });
      }

      try {
        const rdpPassword = decrypt(user.rdpPassword);
        launchRdpSession(user.rdpHost, user.rdpUsername, rdpPassword);

        await prisma.toolLaunch.create({
          data: { userId: session.user.id, toolId: id },
        });

        return NextResponse.json({
          message: "Launch recorded",
          launchUrl: null,
          launchType: tool.launchType,
          desktopStatus: "launched",
        });
      } catch (rdpError) {
        return NextResponse.json({
          message: "Launch failed",
          launchType: tool.launchType,
          desktopStatus: "error",
          error:
            rdpError instanceof Error
              ? rdpError.message
              : "Failed to launch RDP session",
        });
      }
    }

    await prisma.toolLaunch.create({
      data: { userId: session.user.id, toolId: id },
    });

    if (tool.launchType === "DESKTOP" && tool.launchUrl) {
      const toolPath = tool.launchUrl;

      if (!existsSync(toolPath)) {
        return NextResponse.json({
          message: "Launch recorded",
          launchUrl: tool.launchUrl,
          launchType: tool.launchType,
          desktopStatus: "not_found",
          error: `Path not found: ${toolPath}`,
        });
      }

      try {
        const isDocsAssistantDashboard =
          existsSync(path.join(toolPath, "backend", "app.py")) &&
          existsSync(path.join(toolPath, "frontend"));

        const isDocsAssistant =
          !isDocsAssistantDashboard &&
          existsSync(path.join(toolPath, "backend", "main.py")) &&
          existsSync(path.join(toolPath, "frontend"));

        if (isDocsAssistantDashboard) {
          launchDocsAssistantDashboard(toolPath);
        } else if (isDocsAssistant) {
          launchDocsAssistant(toolPath);
        } else if (toolPath.endsWith(".exe")) {
          spawn(toolPath, [], {
            stdio: "ignore",
            windowsHide: true,
          }).unref();
        } else {
          spawnHidden("npm", ["start"], toolPath);
        }

        return NextResponse.json({
          message: "Launch recorded",
          launchUrl: effectiveLaunchUrl,
          launchType: tool.launchType,
          desktopStatus: "launched",
        });
      } catch (spawnError) {
        return NextResponse.json({
          message: "Launch recorded",
          launchUrl: tool.launchUrl,
          launchType: tool.launchType,
          desktopStatus: "error",
          error:
            spawnError instanceof Error
              ? spawnError.message
              : "Failed to launch",
        });
      }
    }

    return NextResponse.json({
      message: "Launch recorded",
      launchUrl: effectiveLaunchUrl,
      launchType: tool.launchType,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

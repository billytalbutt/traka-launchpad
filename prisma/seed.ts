import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user (password: admin123)
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@traka.com" },
    update: { role: "ADMIN", isApproved: true },
    create: {
      email: "admin@traka.com",
      name: "Admin",
      hashedPassword: adminPassword,
      role: "ADMIN",
      isApproved: true,
    },
  });

  console.log("Created admin user:", admin.email);

  // Approve all existing users (for migration from pre-approval system)
  await prisma.user.updateMany({
    where: { isApproved: false },
    data: { isApproved: true },
  });
  console.log("Approved all existing users");

  // Seed tools
  const tools: Array<{
    name: string;
    description: string;
    iconName: string;
    launchUrl?: string;
    launchType: string;
    category: string;
    version: string | null;
    sortOrder: number;
    color: string;
    allowedRoles?: string;
    helpText?: string;
  }> = [
    {
      name: "Traka Log Analyzer",
      description:
        "Discover, view, compare, and analyze Traka Business Engine, Comms Engine, and Integration Engine log files with pattern detection and issue highlighting.",
      iconName: "file-search",
      launchUrl: "C:\\DEV\\Traka Tools Suite\\TrakaLogAnalyzer-WebPoC",
      launchType: "DESKTOP",
      category: "Diagnostics",
      version: "3.0.0",
      sortOrder: 1,
      color: "#3b82f6",
      helpText:
        "The Log Analyzer is a desktop application for parsing and analyzing Traka engine log files.\n\nHow to access:\nLaunch from your desktop — requires the Log Analyzer installer. Contact your team lead if you don't have it installed.\n\nWhat it does:\n• Opens and parses Business Engine, Comms Engine, and Integration Engine logs\n• Highlights errors, warnings, and patterns automatically\n• Compare multiple log files side-by-side\n• Filter and search across log entries\n\nContact:\nFor installation or issues, contact the App Support team.",
    },
    {
      name: "Traka Data Tool",
      description:
        "Bulk create users, item access groups, and items via the Integration Engine API. Ideal for large-scale TrakaWEB deployments and testing.",
      iconName: "database",
      launchUrl: "C:\\DEV\\Traka Tools Suite\\TrakaDataTool-Electron",
      launchType: "DESKTOP",
      category: "Data Management",
      version: "2.0.0",
      sortOrder: 2,
      color: "#8b5cf6",
      helpText:
        "The Data Tool lets you bulk-create entities in TrakaWEB through the Integration Engine API.\n\nHow to access:\nDesktop application — requires installer. Ensure the Integration Engine is running and accessible.\n\nWhat it does:\n• Bulk create users, item access groups, and items\n• Connect to any Integration Engine endpoint\n• Ideal for setting up large deployments and test environments\n• Supports configurable batch sizes\n\nContact:\nFor installation or access, contact the App Support team.",
    },
    {
      name: "Traka CSV User Import",
      description:
        "Import users from CSV files into TrakaWEB via the Integration Engine API with field mapping, IAG assignment, and software permissions.",
      iconName: "csv",
      launchUrl: "C:\\DEV\\Traka Tools Suite\\TrakaCsvUserImportTool-Electron",
      launchType: "DESKTOP",
      category: "Data Management",
      version: "2.0.0",
      sortOrder: 3,
      color: "#10b981",
      helpText:
        "CSV User Import allows you to import users from spreadsheets into TrakaWEB.\n\nHow to access:\nDesktop application — requires installer and a running Integration Engine.\n\nWhat it does:\n• Import users from CSV files with flexible field mapping\n• Assign Item Access Groups during import\n• Configure software permissions per user\n• Preview and validate data before committing\n\nContact:\nFor the installer or help with CSV formatting, contact the App Support team.",
    },
    {
      name: "Traka Docs Assistant",
      description:
        "AI-powered documentation assistant for Traka products. Ask questions and get instant answers with source references from the knowledge base.",
      iconName: "traka-ai",
      launchUrl: "https://docs.traka.test",
      launchType: "WEB",
      category: "Documentation",
      version: "1.0.0",
      sortOrder: 4,
      color: "#f59e0b",
      helpText:
        "The Docs Assistant is an AI-powered chatbot trained on Traka product documentation.\n\nHow to access:\nOpens in your browser. The service must be running locally on port 5173.\n\nWhat it does:\n• Ask natural language questions about Traka products\n• Get instant answers with source references\n• Covers TrakaWEB, hardware, APIs, and configuration\n• References are linked back to original documentation\n\nContact:\nFor issues with the assistant or incorrect answers, contact the App Support team.",
    },
    {
      name: "Docs Assistant Control Panel",
      description:
        "Admin control panel for the Traka Docs Assistant. Manage the knowledge base, view usage analytics, and configure AI behaviour.",
      iconName: "traka-ai-settings",
      launchUrl: "C:\\DEV\\traka-docs-assistant\\dashboard",
      launchType: "DESKTOP",
      category: "Documentation",
      version: "1.0.0",
      sortOrder: 5,
      color: "#d97706",
      allowedRoles: "ADMIN,APP_SUPPORT",
      helpText:
        "The Docs Assistant Control Panel lets administrators manage the AI documentation system.\n\nHow to access:\nOpens in your browser. Only available to Admin and App Support roles.\n\nWhat it does:\n• Upload and manage knowledge base documents\n• View usage analytics and popular queries\n• Configure AI model behaviour and response settings\n• Review and improve answer quality\n\nContact:\nFor access requests or configuration help, contact the App Support team lead.",
    },
    {
      name: "TrakaWEB Item Bookings",
      description:
        "Modern web portal for booking and managing Traka items. Schedule key/asset check-outs with calendar integration.",
      iconName: "calendar-check",
      launchUrl: "https://bookings.traka.test",
      launchType: "WEB",
      category: "Operations",
      version: "1.0.0",
      sortOrder: 6,
      color: "#ec4899",
      helpText:
        "Item Bookings is a web portal for scheduling key and asset check-outs.\n\nHow to access:\nOpens in your browser. The booking service must be running on port 5000.\n\nWhat it does:\n• Schedule future key/asset check-outs\n• View booking calendar with availability\n• Manage recurring bookings\n• Integration with TrakaWEB permissions\n\nContact:\nFor access or booking issues, contact your local Traka administrator.",
    },
    {
      name: "Integration Engine API",
      description:
        "Swagger documentation and testing interface for the Traka Integration Engine REST API. Explore endpoints and test requests.",
      iconName: "swagger",
      launchUrl: "https://api.traka.test/Traka/swagger",
      launchType: "WEB",
      category: "Development",
      version: "1.0.0",
      sortOrder: 7,
      color: "#06b6d4",
      helpText:
        "The Integration Engine API Swagger page provides interactive API documentation.\n\nHow to access:\nOpens in your browser. The Integration Engine must be running on port 10700.\n\nWhat it does:\n• Browse all available REST API endpoints\n• Test API requests directly from the browser\n• View request/response schemas and examples\n• Authenticate and test secured endpoints\n\nContact:\nFor API questions or integration help, contact the development team.",
    },
    {
      name: "TrakaWEB",
      description:
        "The main TrakaWEB management console. Manage users, keys, lockers, permissions, reports, and system configuration.",
      iconName: "trakaweb",
      launchUrl: "http://localhost/trakaweb",
      launchType: "WEB",
      category: "Operations",
      version: "4.0.0",
      sortOrder: 8,
      color: "#0078D4",
      helpText:
        "TrakaWEB is the main management console for your Traka system.\n\nHow to access:\nOpens in your browser. Requires TrakaWEB to be installed and running on the server.\n\nWhat it does:\n• Manage users and their permissions\n• Configure keys, lockers, and cabinets\n• Set up item access groups and policies\n• Run reports on key usage and audits\n• System configuration and maintenance\n\nContact:\nFor access issues, contact your local Traka administrator. For technical problems, contact the support team.",
    },
    {
      name: "SMTP Tool",
      description:
        "Configure and test SMTP email relay settings for Traka notifications. Send test emails, verify connectivity, and diagnose delivery issues.",
      iconName: "smtp",
      launchUrl: "C:\\DEV\\Traka Tools Suite\\TrakaSmtpTestTool\\TrakaSmtpTestTool.GUI\\bin\\Debug\\net6.0-windows\\win-x64\\TrakaSmtpTestTool.GUI.exe",
      launchType: "DESKTOP",
      category: "Diagnostics",
      version: "1.0.0",
      sortOrder: 9,
      color: "#ea580c",
      helpText:
        "The SMTP Tool helps you configure and troubleshoot email delivery for Traka systems.\n\nHow to access:\nDesktop application — requires the SMTP Tool installer.\n\nWhat it does:\n• Configure SMTP server settings (host, port, auth)\n• Send test emails to verify connectivity\n• Diagnose common delivery issues\n• Test TLS/SSL configurations\n• Verify relay permissions\n\nContact:\nFor the installer or SMTP configuration help, contact the App Support team.",
    },
    {
      name: "Jira",
      description:
        "Atlassian Jira project management and issue tracking. Manage support tickets, track bugs, and coordinate development sprints.",
      iconName: "jira",
      launchUrl: "https://jira.assaabloy.net/secure/Dashboard.jspa",
      launchType: "WEB",
      category: "Project Management",
      version: null,
      sortOrder: 10,
      color: "#2563eb",
      allowedRoles: "ADMIN,APP_SUPPORT,EU_TECH_SUPPORT",
      helpText:
        "Jira is the project management and issue tracking platform used by the Traka team.\n\nHow to access:\nOpens in your browser. Sign in with your ASSA ABLOY network credentials.\n\nWhat it does:\n• Create and track support tickets\n• Log bugs and feature requests\n• View project boards and sprint progress\n• Manage workflows and assignments\n\nContact:\nIf you don't have access to Jira, contact your line manager or the App Support team to request access.",
    },
    {
      name: "Confluence",
      description:
        "Atlassian Confluence knowledge base and documentation wiki. Access internal documentation, guides, and team collaboration spaces.",
      iconName: "confluence",
      launchUrl: "https://confluence.assaabloy.net/index.action#all-updates",
      launchType: "WEB",
      category: "Documentation",
      version: null,
      sortOrder: 11,
      color: "#1d4ed8",
      allowedRoles: "ADMIN,APP_SUPPORT,EU_TECH_SUPPORT",
      helpText:
        "Confluence is the internal knowledge base and documentation wiki for Traka.\n\nHow to access:\nOpens in your browser. Sign in with your ASSA ABLOY network credentials.\n\nWhat it does:\n• Access internal product documentation and guides\n• Browse team spaces and project wikis\n• Find how-to articles and troubleshooting guides\n• Collaborate on documents with your team\n\nContact:\nIf you don't have access to Confluence, contact your line manager or the App Support team to request access.",
    },
    {
      name: "My VM",
      description:
        "Launch a Remote Desktop session to your personal VM. Connects using your pre-configured RDP credentials with one click.",
      iconName: "rdp",
      launchType: "DESKTOP",
      category: "Remote Access",
      version: null,
      sortOrder: 12,
      color: "#7c3aed",
      helpText:
        "My VM launches a Remote Desktop (RDP) session to your personal virtual machine.\n\nHow to access:\nClick the card to connect. Your RDP credentials must be configured first in your Profile page.\n\nSetup:\n1. Go to your Profile page\n2. Enter your VM hostname, username, and password\n3. Click Save\n4. Return to the launchpad and click this card\n\nWhat it does:\n• Stores your RDP credentials securely (encrypted)\n• Opens the native Windows Remote Desktop client (mstsc.exe)\n• Auto-logs in with your saved credentials\n• No need to remember hostnames or passwords\n\nContact:\nIf you don't know your VM details, contact your team lead or the IT team.",
    },
  ];

  for (const tool of tools) {
    const data = {
      name: tool.name,
      description: tool.description,
      iconName: tool.iconName,
      launchUrl: tool.launchUrl ?? null,
      launchType: tool.launchType,
      category: tool.category,
      version: tool.version,
      sortOrder: tool.sortOrder,
      color: tool.color,
      allowedRoles: tool.allowedRoles ?? null,
      helpText: tool.helpText ?? null,
    };
    await prisma.tool.upsert({
      where: { id: tool.name.toLowerCase().replace(/\s+/g, "-") },
      update: data,
      create: {
        id: tool.name.toLowerCase().replace(/\s+/g, "-"),
        ...data,
      },
    });
  }

  console.log(`Seeded ${tools.length} tools`);

  // Create a welcome announcement
  await prisma.announcement.upsert({
    where: { id: "welcome" },
    update: {},
    create: {
      id: "welcome",
      title: "Welcome to Traka Launchpad",
      content:
        "Your central hub for all Traka tools and products. Pin your favorites and launch any tool with a single click.",
      type: "INFO",
      isActive: true,
      createdBy: admin.id,
    },
  });

  console.log("Seeded welcome announcement");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user (password: admin123)
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@traka.com" },
    update: {},
    create: {
      email: "admin@traka.com",
      name: "Admin",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Seed tools
  const tools = [
    {
      name: "Traka Log Analyzer",
      description:
        "Discover, view, compare, and analyze Traka Business Engine, Comms Engine, and Integration Engine log files with pattern detection and issue highlighting.",
      iconName: "file-search",
      launchType: "DESKTOP",
      category: "Diagnostics",
      version: "3.0.0",
      sortOrder: 1,
      color: "#3b82f6",
    },
    {
      name: "Traka Data Tool",
      description:
        "Bulk create users, item access groups, and items via the Integration Engine API. Ideal for large-scale TrakaWEB deployments and testing.",
      iconName: "database",
      launchType: "DESKTOP",
      category: "Data Management",
      version: "2.0.0",
      sortOrder: 2,
      color: "#8b5cf6",
    },
    {
      name: "Traka CSV User Import",
      description:
        "Import users from CSV files into TrakaWEB via the Integration Engine API with field mapping, IAG assignment, and software permissions.",
      iconName: "file-spreadsheet",
      launchType: "DESKTOP",
      category: "Data Management",
      version: "2.0.0",
      sortOrder: 3,
      color: "#10b981",
    },
    {
      name: "Traka Docs Assistant",
      description:
        "AI-powered documentation assistant for Traka products. Ask questions and get instant answers with source references from the knowledge base.",
      iconName: "bot",
      launchUrl: "http://localhost:5173",
      launchType: "WEB",
      category: "Documentation",
      version: "1.0.0",
      sortOrder: 4,
      color: "#f59e0b",
    },
    {
      name: "TrakaWEB Item Bookings",
      description:
        "Modern web portal for booking and managing Traka items. Schedule key/asset check-outs with calendar integration.",
      iconName: "calendar-check",
      launchUrl: "http://localhost:5000",
      launchType: "WEB",
      category: "Operations",
      version: "1.0.0",
      sortOrder: 5,
      color: "#ec4899",
    },
    {
      name: "Integration Engine API",
      description:
        "Swagger documentation and testing interface for the Traka Integration Engine REST API. Explore endpoints and test requests.",
      iconName: "plug",
      launchUrl: "http://localhost:10700/Traka/swagger",
      launchType: "WEB",
      category: "Development",
      version: "1.0.0",
      sortOrder: 6,
      color: "#06b6d4",
    },
    {
      name: "TrakaWEB",
      description:
        "The main TrakaWEB management console. Manage users, keys, lockers, permissions, reports, and system configuration.",
      iconName: "layout-dashboard",
      launchUrl: "http://localhost/TrakaWeb",
      launchType: "WEB",
      category: "Operations",
      version: "4.0.0",
      sortOrder: 7,
      color: "#0078D4",
    },
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { id: tool.name.toLowerCase().replace(/\s+/g, "-") },
      update: tool,
      create: {
        id: tool.name.toLowerCase().replace(/\s+/g, "-"),
        ...tool,
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

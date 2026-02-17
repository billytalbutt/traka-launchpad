import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // First user becomes admin (auto-approved), others require approval
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const role = isFirstUser ? "ADMIN" : "APP_SUPPORT";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
        isApproved: isFirstUser,
      },
    });

    return NextResponse.json(
      {
        message: isFirstUser
          ? "Admin account created successfully"
          : "Account created. An administrator will review and approve your account.",
        userId: user.id,
        needsApproval: !isFirstUser,
      },
      { status: 201 }
    );
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

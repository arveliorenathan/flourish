import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/schema/user.schema";
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const { username, email, password } = registerSchema
      .omit({ confirmPassword: true })
      .parse(body);

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    //Check if username already exist
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { user: null, message: "Username is already registered." },
        { status: 409 }
      );
    }

    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "Email is already registered." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { user: newUser, message: "Created user successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Error user successfully", error: String(error) },
      { status: 500 }
    );
  }
}

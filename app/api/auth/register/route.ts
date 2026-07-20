import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already registered" },
        { status: 409 },
      );
    }

    await User.create({
      email: normalizedEmail,
      password,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("Registration error", error);
    return NextResponse.json(
      {
        error: "Failed to register user",
      },
      { status: 500 },
    );
  }
}

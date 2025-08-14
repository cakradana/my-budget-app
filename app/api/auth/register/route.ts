import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashedPassword,
      })
      .returning();

    // Create default categories for the new user
    const defaultCategories = [
      { name: "Makan", type: "weekly" as const, userId: newUser.id },
      { name: "Transportasi", type: "weekly" as const, userId: newUser.id },
      { name: "Kost/Sewa", type: "monthly" as const, userId: newUser.id },
      { name: "Keluarga", type: "monthly" as const, userId: newUser.id },
      { name: "Tabungan", type: "monthly" as const, userId: newUser.id },
      { name: "Hiburan", type: "other" as const, userId: newUser.id },
      { name: "Gaji", type: "monthly" as const, userId: newUser.id },
    ];

    await db.insert(categories).values(defaultCategories);

    return NextResponse.json(
      { 
        message: "User created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

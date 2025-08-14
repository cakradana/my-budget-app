/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";

const createTransactionSchema = z.object({
  amount: z.number(),
  categoryId: z.string().uuid(),
  date: z.string(),
  note: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, (session as any).user.id));

    return NextResponse.json(userTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: (session as any).user.id,
        amount: validatedData.amount,
        categoryId: validatedData.categoryId,
        date: validatedData.date,
        note: validatedData.note || null,
      })
      .returning();

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

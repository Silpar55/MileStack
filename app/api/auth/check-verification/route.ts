import { NextRequest, NextResponse } from "next/server";
import { withCORS, withSecurityHeaders } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user[0].email,
      isEmailVerified: user[0].isEmailVerified,
    });
  } catch (error) {
    console.error("Check verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withSecurityHeaders(
  withCORS(async (request: NextRequest) => {
    return handler(request);
  })
);

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  challenges,
  challengeSubmissions,
  challengeRatings,
  userProgress,
} from "@/shared/schema";
import { eq, and, desc, asc, like, inArray, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const subcategory = searchParams.get("subcategory");
    const tags = searchParams.get("tags");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const userId = searchParams.get("userId");

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [
      eq(challenges.isActive, true),
      eq(challenges.isPublic, true),
    ];

    if (category) {
      conditions.push(eq(challenges.category, category));
    }

    if (difficulty) {
      conditions.push(eq(challenges.difficulty, difficulty));
    }

    if (subcategory) {
      conditions.push(eq(challenges.subcategory, subcategory));
    }

    if (tags) {
      const tagArray = tags.split(",");
      conditions.push(sql`${challenges.tags} && ${JSON.stringify(tagArray)}`);
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case "points":
        orderBy =
          sortOrder === "asc"
            ? asc(challenges.points)
            : desc(challenges.points);
        break;
      case "rating":
        orderBy =
          sortOrder === "asc"
            ? asc(challenges.rating)
            : desc(challenges.rating);
        break;
      case "solvedCount":
        orderBy =
          sortOrder === "asc"
            ? asc(challenges.solvedCount)
            : desc(challenges.solvedCount);
        break;
      case "title":
        orderBy =
          sortOrder === "asc" ? asc(challenges.title) : desc(challenges.title);
        break;
      default:
        orderBy =
          sortOrder === "asc"
            ? asc(challenges.createdAt)
            : desc(challenges.createdAt);
    }

    // Get challenges with user progress if userId provided
    const challengesQuery = db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        category: challenges.category,
        subcategory: challenges.subcategory,
        points: challenges.points,
        timeLimit: challenges.timeLimit,
        memoryLimit: challenges.memoryLimit,
        tags: challenges.tags,
        rating: challenges.rating,
        ratingCount: challenges.ratingCount,
        submissionCount: challenges.submissionCount,
        solvedCount: challenges.solvedCount,
        createdAt: challenges.createdAt,
      })
      .from(challenges)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const challengesResult = await challengesQuery;

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(challenges)
      .where(and(...conditions));

    const [{ count: totalCount }] = await totalCountQuery;

    // Get category statistics
    const categoryStats = await db
      .select({
        category: challenges.category,
        count: sql<number>`count(*)`,
        avgRating: sql<number>`avg(${challenges.rating})`,
        avgPoints: sql<number>`avg(${challenges.points})`,
      })
      .from(challenges)
      .where(and(eq(challenges.isActive, true), eq(challenges.isPublic, true)))
      .groupBy(challenges.category);

    return NextResponse.json({
      challenges: challengesResult,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      categoryStats,
    });
  } catch (error) {
    console.error("Challenges retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      category,
      subcategory,
      points,
      timeLimit,
      memoryLimit,
      prerequisites,
      tags,
      starterCode,
      testCases,
      expectedOutput,
      hints,
      solution,
      createdBy,
    } = body;

    // Validate required fields
    if (!title || !description || !difficulty || !category || !testCases) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "data-structures",
      "algorithms",
      "web-dev",
      "database",
      "system-design",
      "machine-learning",
      "security",
      "mobile-dev",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Create challenge
    const challenge = await db
      .insert(challenges)
      .values({
        title,
        description,
        difficulty,
        category,
        subcategory,
        points: points || 100,
        timeLimit,
        memoryLimit,
        prerequisites,
        tags,
        starterCode,
        testCases,
        expectedOutput,
        hints,
        solution,
        createdBy,
        isActive: true,
        isPublic: false, // New challenges need approval
      })
      .returning();

    return NextResponse.json({
      success: true,
      challenge: challenge[0],
      message:
        "Challenge created successfully. It will be reviewed before going live.",
    });
  } catch (error) {
    console.error("Challenge creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

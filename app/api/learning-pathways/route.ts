import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  learningPathways,
  pathwayCheckpoints,
  pathwayProgress,
} from "@/shared/schema";
import { eq, and, desc, asc, like, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query conditions
    const conditions = [
      eq(learningPathways.isActive, true),
      eq(learningPathways.isPublic, true),
    ];

    if (category && category !== "all") {
      conditions.push(eq(learningPathways.category, category));
    }

    if (difficulty && difficulty !== "all") {
      conditions.push(eq(learningPathways.difficulty, difficulty));
    }

    if (search) {
      conditions.push(like(learningPathways.title, `%${search}%`));
    }

    // Build order by clause
    let orderBy;
    switch (sortBy) {
      case "title":
        orderBy =
          sortOrder === "asc"
            ? asc(learningPathways.title)
            : desc(learningPathways.title);
        break;
      case "difficulty":
        orderBy =
          sortOrder === "asc"
            ? asc(learningPathways.difficulty)
            : desc(learningPathways.difficulty);
        break;
      case "totalPoints":
        orderBy =
          sortOrder === "asc"
            ? asc(learningPathways.totalPoints)
            : desc(learningPathways.totalPoints);
        break;
      case "estimatedDuration":
        orderBy =
          sortOrder === "asc"
            ? asc(learningPathways.estimatedDuration)
            : desc(learningPathways.estimatedDuration);
        break;
      default:
        orderBy =
          sortOrder === "asc"
            ? asc(learningPathways.createdAt)
            : desc(learningPathways.createdAt);
    }

    // Get pathways
    const pathways = await db
      .select()
      .from(learningPathways)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: learningPathways.id })
      .from(learningPathways)
      .where(and(...conditions));

    // Get checkpoints for each pathway
    const pathwayIds = pathways.map((p) => p.id);
    const checkpoints = await db
      .select()
      .from(pathwayCheckpoints)
      .where(
        and(
          inArray(pathwayCheckpoints.pathwayId, pathwayIds),
          eq(pathwayCheckpoints.isActive, true)
        )
      )
      .orderBy(asc(pathwayCheckpoints.order));

    // Get user progress if userId provided
    let userProgress: any[] = [];
    if (userId) {
      userProgress = await db
        .select()
        .from(pathwayProgress)
        .where(
          and(
            inArray(pathwayProgress.pathwayId, pathwayIds),
            eq(pathwayProgress.userId, userId)
          )
        );
    }

    // Group checkpoints by pathway
    const checkpointsByPathway = checkpoints.reduce((acc, checkpoint) => {
      if (!acc[checkpoint.pathwayId]) {
        acc[checkpoint.pathwayId] = [];
      }
      acc[checkpoint.pathwayId].push(checkpoint);
      return acc;
    }, {} as Record<string, any[]>);

    // Group progress by pathway
    const progressByPathway = userProgress.reduce((acc, progress) => {
      acc[progress.pathwayId] = progress;
      return acc;
    }, {} as Record<string, any>);

    // Build response
    const response = pathways.map((pathway) => {
      const pathwayCheckpoints = checkpointsByPathway[pathway.id] || [];
      const progress = progressByPathway[pathway.id];

      return {
        ...pathway,
        checkpoints: pathwayCheckpoints.length,
        totalCheckpoints: pathwayCheckpoints.length,
        userProgress: progress
          ? {
              status: progress.status,
              completedCheckpoints: progress.completedCheckpoints,
              totalPoints: progress.totalPoints,
              timeSpent: progress.timeSpent,
              startedAt: progress.startedAt,
              completedAt: progress.completedAt,
              lastAccessedAt: progress.lastAccessedAt,
            }
          : null,
        isStarted: !!progress,
        isCompleted: progress?.status === "completed",
        progressPercentage: progress
          ? Math.round(
              (progress.completedCheckpoints / pathwayCheckpoints.length) * 100
            )
          : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        pathways: response,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("Learning pathways fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning pathways" },
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
      category,
      difficulty,
      estimatedDuration,
      prerequisites,
      tags,
      checkpoints,
      createdBy,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !difficulty) {
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

    // Calculate total points
    const totalPoints =
      checkpoints?.reduce(
        (sum: number, checkpoint: any) => sum + (checkpoint.points || 0),
        0
      ) || 0;

    // Create pathway
    const pathway = await db
      .insert(learningPathways)
      .values({
        title,
        description,
        category,
        difficulty,
        totalPoints,
        estimatedDuration,
        prerequisites,
        tags,
        createdBy,
      })
      .returning();

    // Create checkpoints if provided
    if (checkpoints && checkpoints.length > 0) {
      const checkpointData = checkpoints.map(
        (checkpoint: any, index: number) => ({
          pathwayId: pathway[0].id,
          title: checkpoint.title,
          description: checkpoint.description,
          type: checkpoint.type,
          order: index + 1,
          points: checkpoint.points,
          timeLimit: checkpoint.timeLimit,
          maxAttempts: checkpoint.maxAttempts,
          passingScore: checkpoint.passingScore,
          prerequisites: checkpoint.prerequisites,
          content: checkpoint.content,
          feedback: checkpoint.feedback,
        })
      );

      await db.insert(pathwayCheckpoints).values(checkpointData);
    }

    return NextResponse.json({
      success: true,
      data: pathway[0],
      message: "Learning pathway created successfully",
    });
  } catch (error) {
    console.error("Learning pathway creation error:", error);
    return NextResponse.json(
      { error: "Failed to create learning pathway" },
      { status: 500 }
    );
  }
}

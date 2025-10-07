import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { challenges, challengeRatings } from "@/shared/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      challengeId,
      userId,
      rating,
      difficultyRating,
      qualityRating,
      feedback,
    } = body;

    // Validate required fields
    if (!challengeId || !userId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating values
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (difficultyRating && (difficultyRating < 1 || difficultyRating > 5)) {
      return NextResponse.json(
        { error: "Difficulty rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (qualityRating && (qualityRating < 1 || qualityRating > 5)) {
      return NextResponse.json(
        { error: "Quality rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if challenge exists
    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if user has already rated this challenge
    const existingRating = await db
      .select()
      .from(challengeRatings)
      .where(
        and(
          eq(challengeRatings.challengeId, challengeId),
          eq(challengeRatings.userId, userId)
        )
      )
      .limit(1);

    let ratingRecord;
    if (existingRating.length > 0) {
      // Update existing rating
      ratingRecord = await db
        .update(challengeRatings)
        .set({
          rating,
          difficultyRating,
          qualityRating,
          feedback,
          updatedAt: new Date(),
        })
        .where(eq(challengeRatings.id, existingRating[0].id))
        .returning();
    } else {
      // Create new rating
      ratingRecord = await db
        .insert(challengeRatings)
        .values({
          challengeId,
          userId,
          rating,
          difficultyRating,
          qualityRating,
          feedback,
        })
        .returning();
    }

    // Update challenge rating statistics
    const ratingStats = await db
      .select({
        avgRating: db.$count(challengeRatings.rating),
        count: db.$count(challengeRatings.id),
      })
      .from(challengeRatings)
      .where(eq(challengeRatings.challengeId, challengeId));

    if (ratingStats.length > 0) {
      await db
        .update(challenges)
        .set({
          rating: Math.round(ratingStats[0].avgRating * 10) / 10, // Round to 1 decimal place
          ratingCount: ratingStats[0].count,
          updatedAt: new Date(),
        })
        .where(eq(challenges.id, challengeId));
    }

    return NextResponse.json({
      success: true,
      rating: ratingRecord[0],
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.error("Challenge rating error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");
    const userId = searchParams.get("userId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Get all ratings for the challenge
    const ratings = await db
      .select()
      .from(challengeRatings)
      .where(eq(challengeRatings.challengeId, challengeId))
      .orderBy(challengeRatings.createdAt);

    // Get user's rating if userId provided
    let userRating = null;
    if (userId) {
      const userRatingResult = await db
        .select()
        .from(challengeRatings)
        .where(
          and(
            eq(challengeRatings.challengeId, challengeId),
            eq(challengeRatings.userId, userId)
          )
        )
        .limit(1);

      if (userRatingResult.length > 0) {
        userRating = userRatingResult[0];
      }
    }

    // Calculate rating statistics
    const stats = {
      totalRatings: ratings.length,
      averageRating:
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) *
                10
            ) / 10
          : 0,
      averageDifficulty:
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + (r.difficultyRating || 0), 0) /
                ratings.length) *
                10
            ) / 10
          : 0,
      averageQuality:
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + (r.qualityRating || 0), 0) /
                ratings.length) *
                10
            ) / 10
          : 0,
      ratingDistribution: {
        1: ratings.filter((r) => r.rating === 1).length,
        2: ratings.filter((r) => r.rating === 2).length,
        3: ratings.filter((r) => r.rating === 3).length,
        4: ratings.filter((r) => r.rating === 4).length,
        5: ratings.filter((r) => r.rating === 5).length,
      },
    };

    return NextResponse.json({
      ratings,
      userRating,
      stats,
    });
  } catch (error) {
    console.error("Challenge ratings retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

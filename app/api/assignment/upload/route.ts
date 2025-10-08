import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import crypto from "crypto";
import { db } from "@/shared/db";
import { assignments } from "@/shared/schema-assignments";

// Supported file types
const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/msword", // DOC
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const courseName = formData.get("courseName") as string;

    // Validate required fields
    if (!file || !userId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: file, userId, title" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 413 }
      );
    }

    // Validate file type
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Unsupported file type",
          supportedTypes: SUPPORTED_MIME_TYPES,
          receivedType: file.type,
        },
        { status: 415 }
      );
    }

    // Generate file hash for deduplication
    const fileBuffer = await file.arrayBuffer();
    const fileHash = crypto
      .createHash("sha256")
      .update(Buffer.from(fileBuffer))
      .digest("hex");

    // Check if file already exists by title and user (simplified check)
    const existingAssignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.title, title))
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        {
          error: "File already exists",
          assignmentId: existingAssignment[0].id,
        },
        { status: 409 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads", "assignments");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = join(uploadDir, uniqueFileName);

    // Save file to disk
    await writeFile(filePath, Buffer.from(fileBuffer));

    // Create assignment record in database
    const assignment = await db
      .insert(assignments)
      .values({
        userId,
        title,
        originalFilename: file.name,
        extractedText: "", // Will be populated during analysis
        analysisStatus: "pending",
        dueDate: dueDate ? new Date(dueDate) : null,
        courseName: courseName || null,
      })
      .returning();

    // Trigger background analysis
    // Note: In production, this would be handled by a queue system
    setTimeout(async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/assignment/analyze`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignmentId: assignment[0].id }),
          }
        );
      } catch (error) {
        console.error("Failed to trigger analysis:", error);
        // Update assignment status to error
        await db
          .update(assignments)
          .set({ analysisStatus: "failed" })
          .where(eq(assignments.id, assignment[0].id));
      }
    }, 1000);

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment[0].id,
        title: assignment[0].title,
        originalFilename: assignment[0].originalFilename,
        analysisStatus: assignment[0].analysisStatus,
        uploadTimestamp: assignment[0].uploadTimestamp,
        dueDate: assignment[0].dueDate,
        courseName: assignment[0].courseName,
      },
      message: "Assignment uploaded successfully. Analysis will begin shortly.",
    });
  } catch (error) {
    console.error("Assignment upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Import eq for database queries
import { eq } from "drizzle-orm";

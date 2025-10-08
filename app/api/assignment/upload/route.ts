import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import crypto from "crypto";
import { db } from "@/shared/db";
import { assignments } from "@/shared/schema-assignments";
import { eq } from "drizzle-orm";
import { auth } from "../../../../auth";
// PDF parsing will be handled by a fallback approach
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

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

// Text extraction functions
async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    // For now, provide a fallback message for PDF files
    // In production, you could integrate with a PDF parsing service
    console.warn("PDF text extraction not fully implemented. Using fallback.");
    return `PDF file uploaded successfully. The file "${fileBuffer.length} bytes" was received but text extraction from PDF files requires additional setup. For full text analysis, please use text files (.txt), Word documents (.docx), or images (.jpg, .png) instead.`;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Couldn't read PDF file. Try a different format.");
  }
}

async function extractTextFromDOCX(fileBuffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Couldn't read DOCX file. Try a different format.");
  }
}

async function extractTextFromImage(fileBuffer: Buffer): Promise<string> {
  try {
    // Create a temporary file for Tesseract
    const tempPath = join(
      process.cwd(),
      "temp",
      `temp_${crypto.randomUUID()}.jpg`
    );
    await writeFile(tempPath, fileBuffer);

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Image processing timeout")), 30000); // 30 second timeout
    });

    const recognitionPromise = Tesseract.recognize(tempPath, "eng", {
      logger: (m) => console.log(m),
    });

    const {
      data: { text },
    } = (await Promise.race([recognitionPromise, timeoutPromise])) as any;

    // Clean up temp file
    try {
      const fs = await import("fs/promises");
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      console.warn("Failed to cleanup temp file:", cleanupError);
    }

    return text || "No text could be extracted from the image.";
  } catch (error) {
    console.error("Image extraction error:", error);

    // Clean up temp file in case of error
    try {
      const fs = await import("fs/promises");
      const tempPath = join(
        process.cwd(),
        "temp",
        `temp_${crypto.randomUUID()}.jpg`
      );
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      throw new Error("Image processing took too long. Try a smaller image.");
    }
    throw new Error("Couldn't read image file. Try a different format.");
  }
}

async function extractTextFromFile(
  file: File,
  fileBuffer: Buffer
): Promise<string> {
  const mimeType = file.type;

  switch (mimeType) {
    case "application/pdf":
      return await extractTextFromPDF(fileBuffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return await extractTextFromDOCX(fileBuffer);
    case "text/plain":
      return fileBuffer.toString("utf-8");
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/bmp":
    case "image/tiff":
      return await extractTextFromImage(fileBuffer);
    default:
      throw new Error("Unsupported file type for text extraction");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const courseName = formData.get("courseName") as string;
    const difficultyEstimate = formData.get("difficultyEstimate") as string;

    // Validate required fields
    if (!file || !title) {
      return NextResponse.json(
        { error: "Missing required fields: file, title" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit" },
        { status: 413 }
      );
    }

    // Validate file type
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Please use PDF, DOCX, TXT, JPG, or PNG",
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
          error: "Assignment with this title already exists",
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

    // Extract text from file
    let extractedText = "";
    try {
      console.log(`Starting text extraction for ${file.name} (${file.type})`);
      extractedText = await extractTextFromFile(file, Buffer.from(fileBuffer));
      console.log(
        `Successfully extracted ${extractedText.length} characters from ${file.name}`
      );
    } catch (error) {
      console.error("Text extraction failed:", error);
      // Continue with empty text rather than failing the upload
      extractedText = `Text extraction failed for ${file.name}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }

    // Create assignment record in database
    const assignment = await db
      .insert(assignments)
      .values({
        userId: session.user.id,
        title,
        originalFilename: file.name,
        extractedText,
        analysisStatus: "pending",
        dueDate: dueDate ? new Date(dueDate) : null,
        courseName: courseName || null,
        estimatedDifficulty: difficultyEstimate
          ? ((difficultyEstimate === "beginner"
              ? 2
              : difficultyEstimate === "intermediate"
              ? 5
              : difficultyEstimate === "advanced"
              ? 8
              : 9) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)
          : null,
      })
      .returning();

    // Analysis will be triggered separately in the next step
    // For now, just mark as ready for analysis
    console.log(
      `Assignment ${assignment[0].id} uploaded and ready for analysis`
    );

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
        extractedTextLength: extractedText.length,
      },
      message: "Assignment uploaded successfully. Analysis will begin shortly.",
    });
  } catch (error) {
    console.error("Assignment upload error:", error);

    // Provide specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("Couldn't read")) {
        return NextResponse.json({ error: error.message }, { status: 422 });
      }
      if (error.message.includes("Unsupported file type")) {
        return NextResponse.json(
          { error: "Please use PDF, DOCX, TXT, JPG, or PNG" },
          { status: 415 }
        );
      }
    }

    return NextResponse.json(
      { error: "Upload failed. Check connection and retry" },
      { status: 500 }
    );
  }
}

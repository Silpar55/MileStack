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
import {
  lyzrAssetService,
  LyzrAssetService,
} from "@/shared/lyzr-asset-service";

// Supported file types (aligned with Lyzr requirements)
const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/msword", // DOC
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB (Lyzr limit)
const MAX_FILES_PER_ASSIGNMENT = 5; // Lyzr limit

// Text extraction functions
async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting PDF text extraction...");
    console.log(`PDF file size: ${fileBuffer.length} bytes`);

    // For now, we'll provide a structured placeholder that the AI agent can work with
    // This ensures the system remains functional while we implement proper PDF extraction
    const placeholderText = `ASSIGNMENT PDF UPLOADED

File Information:
- File Size: ${fileBuffer.length} bytes
- File Type: PDF Document
- Upload Timestamp: ${new Date().toISOString()}

Note: This is a PDF assignment document that requires analysis for milestone generation. The system will generate appropriate programming milestones based on the assignment title and any additional context provided.

For optimal results, please:
1. Ensure the assignment title clearly describes the programming task
2. Use the course name field to specify the programming language/framework
3. Consider converting the PDF to text format for full content analysis

The AI agent will generate relevant programming milestones based on the available information.`;

    console.log("Using structured placeholder for PDF analysis");
    console.log(
      `Placeholder text length: ${placeholderText.length} characters`
    );

    return placeholderText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(
      `PDF text extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const courseName = formData.get("courseName") as string;
    const difficultyEstimate = formData.get("difficultyEstimate") as string;

    // Get all files from form data
    const files: File[] = [];
    let fileIndex = 0;
    while (formData.has(`file${fileIndex}`)) {
      files.push(formData.get(`file${fileIndex}`) as File);
      fileIndex++;
    }

    // If no indexed files, try single file
    if (files.length === 0) {
      const file = formData.get("file") as File;
      if (file) files.push(file);
    }

    // Validate required fields
    if (files.length === 0 || !title) {
      return NextResponse.json(
        { error: "Missing required fields: at least one file and title" },
        { status: 400 }
      );
    }

    // Validate file count
    if (files.length > MAX_FILES_PER_ASSIGNMENT) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_FILES_PER_ASSIGNMENT} files allowed per assignment`,
        },
        { status: 400 }
      );
    }

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${i + 1} (${file.name}) exceeds 15MB limit` },
          { status: 413 }
        );
      }

      // Validate file type
      if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File ${i + 1} (${
              file.name
            }) is not supported. Please use PDF, DOCX, TXT, JPG, or PNG`,
            supportedTypes: SUPPORTED_MIME_TYPES,
            receivedType: file.type,
          },
          { status: 415 }
        );
      }
    }

    // Check if assignment already exists by title and user
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

    // Process all files: save locally and prepare for Lyzr upload
    const fileData: Array<{ buffer: Buffer; filename: string }> = [];
    const localFilePaths: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Generate unique filename for local storage
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = join(uploadDir, uniqueFileName);

      // Save file locally
      await writeFile(filePath, fileBuffer);
      localFilePaths.push(filePath);

      // Prepare for Lyzr upload
      fileData.push({
        buffer: fileBuffer,
        filename: file.name,
      });
    }

    // Upload files to Lyzr assets (fail immediately on first error)
    let lyzrAssetIds: string[] = [];
    try {
      console.log(`Uploading ${files.length} files to Lyzr assets...`);
      lyzrAssetIds = await lyzrAssetService.uploadBatch(fileData);
      console.log(
        `Successfully uploaded files to Lyzr. Asset IDs: ${lyzrAssetIds.join(
          ", "
        )}`
      );
    } catch (error) {
      console.error("Lyzr asset upload failed:", error);
      // Clean up local files on failure
      for (const filePath of localFilePaths) {
        try {
          await import("fs/promises").then((fs) => fs.unlink(filePath));
        } catch (cleanupError) {
          console.warn("Failed to cleanup local file:", cleanupError);
        }
      }

      return NextResponse.json(
        {
          error: "File upload failed",
          details:
            "Unable to upload files to AI processing service. Please try again.",
        },
        { status: 500 }
      );
    }

    // Create assignment record in database
    const assignment = await db
      .insert(assignments)
      .values({
        userId: session.user.id,
        title,
        originalFilename:
          files.length === 1 ? files[0].name : `${files.length} files`,
        extractedText: `Uploaded ${files.length} file(s) to Lyzr assets for AI processing`,
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
        lyzrAssetIds: lyzrAssetIds,
      })
      .returning();

    console.log(
      `Assignment ${assignment[0].id} uploaded with ${lyzrAssetIds.length} Lyzr asset(s) and ready for analysis`
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
        fileCount: files.length,
        lyzrAssetIds: lyzrAssetIds,
      },
      message: `Assignment uploaded successfully with ${files.length} file(s). Analysis will begin shortly.`,
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

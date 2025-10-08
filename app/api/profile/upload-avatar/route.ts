import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/shared/auth";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import {
  processAndSaveImage,
  validateImage,
  getExtensionFromMimeType,
  generateFilename,
  deleteLocalImage,
} from "@/shared/server-image-processing";
import {
  uploadProcessedImageToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
} from "@/shared/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Get user from auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    // Validate image
    const validation = validateImage(buffer, mimeType);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get current user data to check for existing avatar
    const currentUser = await db
      .select({
        profilePicture: users.profilePicture,
        profilePictureProvider: users.profilePictureProvider,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentAvatar = currentUser[0];

    // Delete old avatar if exists
    if (currentAvatar.profilePicture) {
      try {
        if (currentAvatar.profilePictureProvider === "cloudinary") {
          // Extract public_id from URL or use stored value
          await deleteFromCloudinary(currentAvatar.profilePicture);
        } else if (currentAvatar.profilePictureProvider === "local") {
          await deleteLocalImage(currentAvatar.profilePicture);
        }
      } catch (error) {
        console.error("Error deleting old avatar:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Process and upload image
    let processedImage;
    let provider: "local" | "cloudinary";

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary
      processedImage = await uploadProcessedImageToCloudinary(buffer, userId, {
        folder: "milestack/profiles",
        createThumbnail: true,
      });
      provider = "cloudinary";
    } else {
      // Save locally
      processedImage = await processAndSaveImage({
        buffer,
        originalName: file.name,
        userId,
        folder: "uploads/avatars",
      });
      provider = "local";
    }

    // Update user record
    await db
      .update(users)
      .set({
        profilePicture: processedImage.url,
        profilePictureProvider: provider,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: processedImage.url,
        thumbnailUrl: processedImage.thumbnailUrl,
        provider,
        metadata: processedImage.metadata,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get current user data
    const currentUser = await db
      .select({
        profilePicture: users.profilePicture,
        profilePictureProvider: users.profilePictureProvider,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentAvatar = currentUser[0];

    // Delete avatar file if exists
    if (currentAvatar.profilePicture) {
      try {
        if (currentAvatar.profilePictureProvider === "cloudinary") {
          await deleteFromCloudinary(currentAvatar.profilePicture);
        } else if (currentAvatar.profilePictureProvider === "local") {
          await deleteLocalImage(currentAvatar.profilePicture);
        }
      } catch (error) {
        console.error("Error deleting avatar:", error);
        // Continue with database update even if file deletion fails
      }
    }

    // Update user record to remove avatar
    await db
      .update(users)
      .set({
        profilePicture: null,
        profilePictureProvider: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error("Avatar deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}

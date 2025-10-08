import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

// Image processing configurations
export const IMAGE_CONFIG = {
  PROFILE_PICTURE: {
    SIZE: 300,
    QUALITY: 85,
    FORMAT: "jpeg" as const,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
  THUMBNAIL: {
    SIZE: 150,
    QUALITY: 80,
    FORMAT: "jpeg" as const,
  },
  ALLOWED_FORMATS: ["jpeg", "jpg", "png", "webp"] as const,
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ] as const,
} as const;

export interface ProcessedImage {
  filename: string;
  path: string;
  url: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export interface ImageUploadOptions {
  buffer: Buffer;
  originalName: string;
  userId: string;
  folder?: string;
}

/**
 * Validate image file
 */
export function validateImage(
  buffer: Buffer,
  mimeType: string
): { valid: boolean; error?: string } {
  // Check MIME type
  if (!IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${IMAGE_CONFIG.ALLOWED_FORMATS.join(
        ", "
      )}`,
    };
  }

  // Check file size
  if (buffer.length > IMAGE_CONFIG.PROFILE_PICTURE.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${
        IMAGE_CONFIG.PROFILE_PICTURE.MAX_FILE_SIZE / (1024 * 1024)
      }MB`,
    };
  }

  return { valid: true };
}

/**
 * Process and optimize image
 */
export async function processImage(
  buffer: Buffer,
  options: {
    size?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
    square?: boolean;
  } = {}
): Promise<Buffer> {
  const {
    size = IMAGE_CONFIG.PROFILE_PICTURE.SIZE,
    quality = IMAGE_CONFIG.PROFILE_PICTURE.QUALITY,
    format = IMAGE_CONFIG.PROFILE_PICTURE.FORMAT,
    square = true,
  } = options;

  let processor = sharp(buffer);

  // Get image metadata
  const metadata = await processor.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image: unable to read dimensions");
  }

  // Resize and crop to square if needed
  if (square) {
    processor = processor.resize(size, size, {
      fit: "cover",
      position: "center",
    });
  } else {
    // Maintain aspect ratio, resize to fit within size
    processor = processor.resize(size, size, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert format and optimize
  switch (format) {
    case "jpeg":
      processor = processor.jpeg({ quality, progressive: true });
      break;
    case "png":
      processor = processor.png({ quality, progressive: true });
      break;
    case "webp":
      processor = processor.webp({ quality });
      break;
  }

  return await processor.toBuffer();
}

/**
 * Save image to local filesystem
 */
export async function saveImageLocally(
  buffer: Buffer,
  filename: string,
  folder: string = "uploads"
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", folder);

  // Ensure directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);

  return `/${folder}/${filename}`;
}

/**
 * Delete local image file
 */
export async function deleteLocalImage(imagePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Error deleting local image:", error);
    // Don't throw error for missing files
  }
}

/**
 * Generate unique filename
 */
export function generateFilename(
  userId: string,
  extension: string = "jpg"
): string {
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  return `profile_${userId}_${timestamp}_${uuid}.${extension}`;
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return mimeToExt[mimeType] || "jpg";
}

/**
 * Complete image processing pipeline
 */
export async function processAndSaveImage(
  options: ImageUploadOptions
): Promise<ProcessedImage> {
  const { buffer, originalName, userId, folder = "uploads" } = options;

  // Get metadata
  const metadata = await sharp(buffer).metadata();
  const extension = getExtensionFromMimeType("image/jpeg"); // We'll get actual MIME type from request
  const filename = generateFilename(userId, extension);

  // Process main image
  const processedBuffer = await processImage(buffer, {
    size: IMAGE_CONFIG.PROFILE_PICTURE.SIZE,
    quality: IMAGE_CONFIG.PROFILE_PICTURE.QUALITY,
    format: IMAGE_CONFIG.PROFILE_PICTURE.FORMAT,
    square: true,
  });

  // Process thumbnail
  const thumbnailBuffer = await processImage(buffer, {
    size: IMAGE_CONFIG.THUMBNAIL.SIZE,
    quality: IMAGE_CONFIG.THUMBNAIL.QUALITY,
    format: IMAGE_CONFIG.THUMBNAIL.FORMAT,
    square: true,
  });

  // Save images
  const imagePath = await saveImageLocally(processedBuffer, filename, folder);
  const thumbnailFilename = `thumb_${filename}`;
  const thumbnailPath = await saveImageLocally(
    thumbnailBuffer,
    thumbnailFilename,
    folder
  );

  return {
    filename,
    path: imagePath,
    url: imagePath, // For local storage, path and URL are the same
    thumbnailPath,
    thumbnailUrl: thumbnailPath,
    metadata: {
      width: IMAGE_CONFIG.PROFILE_PICTURE.SIZE,
      height: IMAGE_CONFIG.PROFILE_PICTURE.SIZE,
      size: processedBuffer.length,
      format: IMAGE_CONFIG.PROFILE_PICTURE.FORMAT,
    },
  };
}

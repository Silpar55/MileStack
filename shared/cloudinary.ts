import { v2 as cloudinary } from "cloudinary";
import { ProcessedImage } from "./server-image-processing";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    userId: string;
    folder?: string;
    publicId?: string;
    transformation?: any;
  }
): Promise<CloudinaryUploadResult> {
  const {
    userId,
    folder = "milestack/profiles",
    publicId,
    transformation,
  } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    } else {
      uploadOptions.public_id = `profile_${userId}_${Date.now()}`;
    }

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        } else {
          reject(new Error("Upload failed: No result returned"));
        }
      })
      .end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw error for missing files
  }
}

/**
 * Generate optimized URL for Cloudinary image
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
    gravity?: string;
  } = {}
): string {
  const {
    width = 300,
    height = 300,
    quality = "auto",
    format = "auto",
    crop = "fill",
    gravity = "face",
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    quality,
    format,
    crop,
    gravity,
    secure: true,
  });
}

/**
 * Generate thumbnail URL for Cloudinary image
 */
export function getCloudinaryThumbnailUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 150,
    height: 150,
    quality: "auto",
    format: "auto",
    crop: "fill",
    gravity: "face",
  });
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload processed image to Cloudinary with optimization
 */
export async function uploadProcessedImageToCloudinary(
  buffer: Buffer,
  userId: string,
  options: {
    folder?: string;
    createThumbnail?: boolean;
  } = {}
): Promise<ProcessedImage> {
  const { folder = "milestack/profiles", createThumbnail = true } = options;

  // Upload main image
  const mainResult = await uploadToCloudinary(buffer, {
    userId,
    folder,
    transformation: {
      width: 300,
      height: 300,
      crop: "fill",
      gravity: "face",
      quality: "auto",
      fetch_format: "auto",
    },
  });

  let thumbnailUrl: string | undefined;
  let thumbnailPath: string | undefined;

  // Upload thumbnail if requested
  if (createThumbnail) {
    thumbnailUrl = getCloudinaryThumbnailUrl(mainResult.public_id);
    thumbnailPath = thumbnailUrl;
  }

  return {
    filename: mainResult.public_id,
    path: mainResult.public_id, // For Cloudinary, we use public_id as path
    url: mainResult.secure_url,
    thumbnailPath,
    thumbnailUrl,
    metadata: {
      width: mainResult.width,
      height: mainResult.height,
      size: mainResult.bytes,
      format: mainResult.format,
    },
  };
}

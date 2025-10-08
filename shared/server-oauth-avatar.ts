import { processAndSaveImage } from "./server-image-processing";
import { uploadProcessedImageToCloudinary } from "./cloudinary";
import { isCloudinaryConfigured } from "./cloudinary";

/**
 * Download OAuth avatar and store it locally or in Cloudinary
 */
export async function downloadAndStoreOAuthAvatar(
  avatarUrl: string,
  userId: string,
  provider: "google" | "github" | "facebook" | "twitter"
): Promise<{
  profilePicture: string;
  profilePictureProvider: "local" | "cloudinary";
  oauthAvatarUrl: string;
}> {
  try {
    // Download the image
    const response = await fetch(avatarUrl, {
      headers: {
        "User-Agent": "MileStack/1.0", // Some APIs require user agent
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download avatar: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Validate image
    if (buffer.length === 0) {
      throw new Error("Downloaded avatar is empty");
    }

    // Process and save the image
    let processedImage;
    let storageProvider: "local" | "cloudinary";

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary
      processedImage = await uploadProcessedImageToCloudinary(buffer, userId, {
        folder: `milestack/oauth-avatars/${provider}`,
        createThumbnail: true,
      });
      storageProvider = "cloudinary";
    } else {
      // Save locally
      processedImage = await processAndSaveImage({
        buffer,
        originalName: `oauth_${provider}_${userId}`,
        userId,
        folder: `uploads/oauth-avatars/${provider}`,
      });
      storageProvider = "local";
    }

    return {
      profilePicture: processedImage.url,
      profilePictureProvider: storageProvider,
      oauthAvatarUrl: avatarUrl,
    };
  } catch (error) {
    console.error("Error downloading OAuth avatar:", error);
    throw error;
  }
}

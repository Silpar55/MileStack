/**
 * Client-side utility to download and store OAuth avatars
 * This runs after authentication to avoid bundling issues
 */

export interface OAuthAvatarDownloadResult {
  success: boolean;
  message: string;
  data?: {
    profilePicture: string;
    profilePictureProvider: string;
    oauthAvatarUrl: string;
  };
  error?: string;
}

/**
 * Download and store OAuth avatar via API call
 */
export async function downloadOAuthAvatar(
  avatarUrl: string,
  provider: "google" | "github" | "facebook" | "twitter",
  accessToken: string
): Promise<OAuthAvatarDownloadResult> {
  try {
    const response = await fetch("/api/profile/oauth-avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        avatarUrl,
        provider,
        // We'll get userId from the token on the server side
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: "Failed to download OAuth avatar",
        error: data.error || "Unknown error",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error while downloading OAuth avatar",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if user has an OAuth avatar URL that needs to be processed
 */
export function hasUnprocessedOAuthAvatar(
  profilePicture: string | null,
  oauthAvatarUrl: string | null
): boolean {
  return !profilePicture && !!oauthAvatarUrl;
}

/**
 * Process OAuth avatar if needed
 * This should be called after authentication to download and store the avatar
 */
export async function processOAuthAvatarIfNeeded(
  profileData: {
    profilePicture?: string | null;
    oauthAvatarUrl?: string | null;
  },
  provider: "google" | "github" | "facebook" | "twitter",
  accessToken: string
): Promise<OAuthAvatarDownloadResult | null> {
  if (
    hasUnprocessedOAuthAvatar(
      profileData.profilePicture || null,
      profileData.oauthAvatarUrl || null
    )
  ) {
    console.log("Processing OAuth avatar:", profileData.oauthAvatarUrl);
    return await downloadOAuthAvatar(
      profileData.oauthAvatarUrl!,
      provider,
      accessToken
    );
  }
  return null;
}

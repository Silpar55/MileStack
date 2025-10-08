/**
 * Extract avatar URL from OAuth provider data
 */
export function extractAvatarUrlFromOAuth(
  oauthData: any,
  provider: "google" | "github" | "facebook" | "twitter"
): string | null {
  switch (provider) {
    case "google":
      return oauthData.picture || oauthData.avatar_url || null;

    case "github":
      return oauthData.avatar_url || oauthData.picture || null;

    case "facebook":
      return oauthData.picture?.data?.url || oauthData.avatar_url || null;

    case "twitter":
      return oauthData.profile_image_url_https || oauthData.avatar_url || null;

    default:
      return oauthData.picture || oauthData.avatar_url || null;
  }
}

/**
 * Check if avatar URL is valid
 */
export function isValidAvatarUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Get optimized avatar URL for OAuth providers
 */
export function getOptimizedOAuthAvatarUrl(
  originalUrl: string,
  provider: "google" | "github" | "facebook" | "twitter",
  size: number = 300
): string {
  if (!isValidAvatarUrl(originalUrl)) {
    return originalUrl;
  }

  switch (provider) {
    case "google":
      // Google allows size parameter
      const googleUrl = new URL(originalUrl);
      googleUrl.searchParams.set("sz", size.toString());
      return googleUrl.toString();

    case "github":
      // GitHub allows size parameter
      return originalUrl.replace(/s=\d+/, `s=${size}`);

    case "facebook":
      // Facebook allows width/height parameters
      const facebookUrl = new URL(originalUrl);
      facebookUrl.searchParams.set("width", size.toString());
      facebookUrl.searchParams.set("height", size.toString());
      return facebookUrl.toString();

    case "twitter":
      // Twitter has different sizes available
      const twitterSizes = {
        24: "_mini",
        48: "_normal",
        73: "_bigger",
        200: "_200x200",
        400: "_400x400",
      };

      const closestSize = Object.keys(twitterSizes)
        .map(Number)
        .sort((a, b) => Math.abs(a - size) - Math.abs(b - size))[0];

      if (
        closestSize &&
        twitterSizes[closestSize as keyof typeof twitterSizes]
      ) {
        return originalUrl.replace(
          "_normal",
          twitterSizes[closestSize as keyof typeof twitterSizes]
        );
      }

      return originalUrl;

    default:
      return originalUrl;
  }
}

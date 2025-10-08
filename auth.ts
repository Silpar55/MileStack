import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "./shared/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  extractAvatarUrlFromOAuth,
  isValidAvatarUrl,
} from "./shared/oauth-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Normalize email for consistent lookup
          const normalizedEmail = (credentials.email as string)
            .toLowerCase()
            .trim();

          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

          if (user.length === 0) {
            return null;
          }

          const userRecord = user[0];

          // Check if this is an OAuth-only account
          if (!userRecord.password) {
            console.log("Attempted manual login for OAuth-only account");
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            userRecord.password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: userRecord.id,
            email: userRecord.email,
            name: `${userRecord.firstName} ${userRecord.lastName}`,
            firstName: userRecord.firstName || "",
            lastName: userRecord.lastName || "",
            isEmailVerified: userRecord.isEmailVerified,
            profilePicture: userRecord.profilePicture,
            profilePictureProvider: userRecord.profilePictureProvider,
            oauthAvatarUrl: userRecord.oauthAvatarUrl,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isEmailVerified = user.isEmailVerified;
        token.profilePicture = (user as any).profilePicture;
        token.profilePictureProvider = (user as any).profilePictureProvider;
        token.oauthAvatarUrl = (user as any).oauthAvatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        (session.user as any).profilePicture = token.profilePicture as
          | string
          | null;
        (session.user as any).profilePictureProvider =
          token.profilePictureProvider as string | null;
        (session.user as any).oauthAvatarUrl = token.oauthAvatarUrl as
          | string
          | null;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-ins
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          console.log("OAuth sign-in attempt:", {
            provider: account.provider,
            email: user.email,
            name: user.name,
          });

          // Normalize email for consistent lookup
          const normalizedEmail = user.email!.toLowerCase().trim();

          // Check if user exists in database (case-insensitive)
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

          if (existingUser.length === 0) {
            console.log("Creating new OAuth user");

            // Create new user for OAuth first
            const [newUser] = await db
              .insert(users)
              .values({
                email: normalizedEmail,
                firstName: user.name?.split(" ")[0] || "",
                lastName: user.name?.split(" ").slice(1).join(" ") || "",
                password: null, // OAuth users don't need password
                isEmailVerified: true, // OAuth emails are pre-verified
                termsAccepted: true, // OAuth users implicitly accept terms
                termsAcceptedAt: new Date(),
                privacyPolicyAccepted: true, // OAuth users implicitly accept privacy policy
                privacyPolicyAcceptedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();

            // Store OAuth avatar URL for later processing
            let oauthAvatarUrl = null;
            try {
              // Extract avatar URL from OAuth provider
              const avatarUrl = extractAvatarUrlFromOAuth(
                profile,
                account.provider as any
              );
              if (avatarUrl && isValidAvatarUrl(avatarUrl)) {
                oauthAvatarUrl = avatarUrl;
                console.log("OAuth avatar URL found:", avatarUrl);

                // Store the OAuth avatar URL for later processing
                await db
                  .update(users)
                  .set({
                    oauthAvatarUrl: avatarUrl,
                    updatedAt: new Date(),
                  })
                  .where(eq(users.id, newUser.id));

                // Automatically process the OAuth avatar as profile picture
                // This will be done in the background via the oauth-avatar endpoint
                console.log("OAuth avatar will be processed automatically");
              }
            } catch (error) {
              console.error("Error storing OAuth avatar URL:", error);
              // Continue without avatar if processing fails
            }

            user.id = newUser.id;
            user.firstName = newUser.firstName || "";
            user.lastName = newUser.lastName || "";
            user.isEmailVerified = newUser.isEmailVerified;
            (user as any).profilePicture = newUser.profilePicture;
            (user as any).profilePictureProvider =
              newUser.profilePictureProvider;
            (user as any).oauthAvatarUrl = newUser.oauthAvatarUrl;
            console.log("New OAuth user created:", newUser.id);
          } else {
            console.log("Existing user found:", existingUser[0].id);
            const existingUserRecord = existingUser[0];

            // Check if we should update OAuth avatar URL (only if user doesn't have one)
            let oauthAvatarUrl = null;
            if (
              !existingUserRecord.profilePicture &&
              !existingUserRecord.oauthAvatarUrl
            ) {
              try {
                const avatarUrl = extractAvatarUrlFromOAuth(
                  profile,
                  account.provider as any
                );
                if (avatarUrl && isValidAvatarUrl(avatarUrl)) {
                  oauthAvatarUrl = avatarUrl;
                  console.log(
                    "OAuth avatar URL found for existing user:",
                    avatarUrl
                  );
                }
              } catch (error) {
                console.error("Error extracting OAuth avatar URL:", error);
                // Continue without avatar if processing fails
              }
            }

            // Update existing user info if needed
            const needsUpdate =
              existingUserRecord.firstName !==
                (user.name?.split(" ")[0] || "") ||
              existingUserRecord.lastName !==
                (user.name?.split(" ").slice(1).join(" ") || "") ||
              existingUserRecord.email !== normalizedEmail ||
              oauthAvatarUrl !== null;

            if (needsUpdate) {
              console.log("Updating existing user info");
              await db
                .update(users)
                .set({
                  firstName:
                    user.name?.split(" ")[0] || existingUserRecord.firstName,
                  lastName:
                    user.name?.split(" ").slice(1).join(" ") ||
                    existingUserRecord.lastName,
                  email: normalizedEmail,
                  isEmailVerified: true, // OAuth emails are always verified
                  oauthAvatarUrl:
                    oauthAvatarUrl || existingUserRecord.oauthAvatarUrl,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUserRecord.id));
            }

            // Set user info for session
            user.id = existingUserRecord.id;
            user.firstName =
              user.name?.split(" ")[0] || existingUserRecord.firstName || "";
            user.lastName =
              user.name?.split(" ").slice(1).join(" ") ||
              existingUserRecord.lastName ||
              "";
            user.isEmailVerified = true; // OAuth emails are always verified
            (user as any).profilePicture = existingUserRecord.profilePicture;
            (user as any).profilePictureProvider =
              existingUserRecord.profilePictureProvider;
            (user as any).oauthAvatarUrl = existingUserRecord.oauthAvatarUrl;

            // If this was a manual account, we can now link it with OAuth
            if (existingUserRecord.password) {
              console.log("Linking existing manual account with OAuth");
              // The user now has both manual and OAuth access to the same account
            }
          }

          console.log("OAuth sign-in successful");
          return true;
        } catch (error) {
          console.error("OAuth sign-in error:", error);
          // If database operations fail, still allow OAuth to proceed
          // but set basic user info
          console.log(
            "Database error occurred, allowing OAuth with basic user info"
          );

          user.id = user.email || "temp-id";
          user.firstName = user.name?.split(" ")[0] || "";
          user.lastName = user.name?.split(" ").slice(1).join(" ") || "";
          user.isEmailVerified = true;
          (user as any).profilePicture = null;
          (user as any).profilePictureProvider = null;
          (user as any).oauthAvatarUrl = null;

          return true;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

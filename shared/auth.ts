import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";
import { users, userSessions, rateLimits, auditLogs } from "./schema";
import { eq, and, lt, gte } from "drizzle-orm";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key";
const JWT_EXPIRES_IN = "15m";
const JWT_REFRESH_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

// Password validation
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

// Verify password
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign(
    {
      userId,
      email,
      type: "access",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Generate refresh token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Verify JWT token
export const verifyAccessToken = (
  token: string
): { userId: string; email: string } | null => {
  try {
    console.log("verifyAccessToken called with token length:", token.length);
    console.log("JWT_SECRET exists:", !!JWT_SECRET);

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token decoded successfully:", {
      type: decoded.type,
      userId: decoded.userId,
      email: decoded.email,
    });

    if (decoded.type !== "access") {
      console.log("Token type mismatch, expected 'access', got:", decoded.type);
      return null;
    }

    console.log("Token verification successful");
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.log("Token verification failed:", error);
    return null;
  }
};

// Create user session
export const createUserSession = async (
  userId: string,
  userAgent: string,
  ipAddress: string
): Promise<string> => {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(userSessions).values({
    userId,
    refreshToken,
    expiresAt,
    userAgent,
    ipAddress,
  });

  return refreshToken;
};

// Verify refresh token
export const verifyRefreshToken = async (
  refreshToken: string
): Promise<{ userId: string; email: string } | null> => {
  const session = await db
    .select({
      userId: userSessions.userId,
      expiresAt: userSessions.expiresAt,
      isActive: userSessions.isActive,
    })
    .from(userSessions)
    .where(eq(userSessions.refreshToken, refreshToken))
    .limit(1);

  if (
    !session.length ||
    !session[0].isActive ||
    session[0].expiresAt < new Date()
  ) {
    return null;
  }

  // Get user email
  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session[0].userId))
    .limit(1);

  if (!user.length) {
    return null;
  }

  // Update last used timestamp
  await db
    .update(userSessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(userSessions.refreshToken, refreshToken));

  return { userId: session[0].userId, email: user[0].email };
};

// Revoke refresh token
export const revokeRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(eq(userSessions.refreshToken, refreshToken));
};

// Revoke all user sessions
export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(eq(userSessions.userId, userId));
};

// Rate limiting
export const checkRateLimit = async (
  identifier: string,
  action: string,
  maxAttempts: number = 5,
  windowMinutes: number = 1
): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
}> => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

  // Clean up old rate limit records
  await db.delete(rateLimits).where(lt(rateLimits.windowStart, windowStart));

  // Check current attempts
  const currentAttempts = await db
    .select({ attempts: rateLimits.attempts })
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.identifier, identifier),
        eq(rateLimits.action, action),
        gte(rateLimits.windowStart, windowStart)
      )
    )
    .limit(1);

  if (currentAttempts.length === 0) {
    // First attempt in this window
    await db.insert(rateLimits).values({
      identifier,
      action,
      attempts: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime: new Date(now.getTime() + windowMinutes * 60 * 1000),
    };
  }

  const attempts = currentAttempts[0].attempts;

  if (attempts >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: new Date(now.getTime() + windowMinutes * 60 * 1000),
    };
  }

  // Increment attempts
  await db
    .update(rateLimits)
    .set({ attempts: attempts + 1 })
    .where(
      and(
        eq(rateLimits.identifier, identifier),
        eq(rateLimits.action, action),
        gte(rateLimits.windowStart, windowStart)
      )
    );

  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempts - 1,
    resetTime: new Date(now.getTime() + windowMinutes * 60 * 1000),
  };
};

// Audit logging
export const logAuditEvent = async (
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null,
  ipAddress: string,
  userAgent: string,
  metadata: any = null
): Promise<void> => {
  await db.insert(auditLogs).values({
    userId,
    action,
    resource,
    resourceId,
    ipAddress,
    userAgent,
    metadata,
  });
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

// Check if user account is locked
export const isAccountLocked = async (userId: string): Promise<boolean> => {
  const user = await db
    .select({ lockedUntil: users.lockedUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) {
    return false;
  }

  return user[0].lockedUntil ? user[0].lockedUntil > new Date() : false;
};

// Lock user account
export const lockUserAccount = async (
  userId: string,
  lockDurationMinutes: number = 30
): Promise<void> => {
  const lockedUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);

  await db
    .update(users)
    .set({
      lockedUntil,
      loginAttempts: 0, // Reset attempts when locking
    })
    .where(eq(users.id, userId));
};

// Unlock user account
export const unlockUserAccount = async (userId: string): Promise<void> => {
  await db
    .update(users)
    .set({
      lockedUntil: null,
      loginAttempts: 0,
    })
    .where(eq(users.id, userId));
};

// Export auth object for compatibility
export const auth = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createUserSession,
  revokeRefreshToken,
  revokeAllUserSessions,
  hashPassword,
  verifyPassword,
  validatePassword,
  checkRateLimit,
  logAuditEvent,
  generateSecureToken,
  isAccountLocked,
  lockUserAccount,
  unlockUserAccount,
};

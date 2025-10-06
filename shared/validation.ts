import { z } from "zod";

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(255, "Email is too long");

// Password validation with custom rules
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  )
  .max(128, "Password is too long");

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters");

// Signup validation
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
  privacyPolicyAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the privacy policy"),
  gdprConsent: z
    .object({
      marketing: z.boolean().optional(),
      analytics: z.boolean().optional(),
      personalization: z.boolean().optional(),
    })
    .optional(),
  ferpaConsent: z.boolean().optional(),
});

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Email verification validation
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password validation
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

// Refresh token validation
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// OAuth callback validation
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  profileData: z.record(z.any()).optional(),
});

// Consent update validation
export const consentUpdateSchema = z.object({
  gdprConsent: z
    .object({
      marketing: z.boolean().optional(),
      analytics: z.boolean().optional(),
      personalization: z.boolean().optional(),
    })
    .optional(),
  ferpaConsent: z.boolean().optional(),
});

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// Session management validation
export const sessionManagementSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

// Rate limit validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  action: z.enum(["login", "signup", "password_reset", "email_verification"]),
});

// Audit log validation
export const auditLogSchema = z.object({
  action: z.string().min(1, "Action is required"),
  resource: z.string().min(1, "Resource is required"),
  resourceId: z.string().uuid("Invalid resource ID").optional(),
  metadata: z.record(z.any()).optional(),
});

// IP address validation
export const ipAddressSchema = z.string().ip("Invalid IP address");

// User agent validation
export const userAgentSchema = z.string().max(500, "User agent is too long");

// Token validation
export const tokenSchema = z.string().min(1, "Token is required");

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),
  ...paginationSchema.shape,
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ConsentUpdateInput = z.infer<typeof consentUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SessionManagementInput = z.infer<typeof sessionManagementSchema>;
export type RateLimitInput = z.infer<typeof rateLimitSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

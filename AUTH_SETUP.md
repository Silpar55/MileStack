# Authentication System Setup Guide

This guide will help you set up the complete authentication system for MileStack.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- SendGrid account (for email)
- Google OAuth credentials
- GitHub OAuth credentials

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/milestack

# JWT Secrets (generate strong random keys)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@milestack.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# University SSO (optional)
UNIVERSITY_SSO_CLIENT_ID=your-university-sso-client-id
UNIVERSITY_SSO_CLIENT_SECRET=your-university-sso-client-secret
UNIVERSITY_SSO_DISCOVERY_URL=https://your-university.edu/.well-known/openid_configuration
```

## Database Setup

1. Run the database migrations:

```bash
npm run db:push
```

This will create all the necessary tables for the authentication system.

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (development)
   - `https://yourdomain.com/api/auth/callback/github` (production)

## Email Setup (SendGrid)

1. Create a [SendGrid account](https://sendgrid.com/)
2. Generate an API key
3. Verify your sender identity
4. Add the API key to your environment variables

## Security Features

The authentication system includes:

- **JWT-based authentication** with access and refresh tokens
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** (5 attempts per IP per minute)
- **Account locking** after 5 failed attempts
- **Email verification** with 24-hour token expiry
- **Password reset** with 1-hour token expiry
- **OAuth2 integration** (Google, GitHub)
- **FERPA/GDPR compliance** with consent tracking
- **Audit logging** for security monitoring
- **Session management** with device tracking

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Email Verification

- `GET /api/auth/verify-email/[token]` - Verify email address

### Password Reset

- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### OAuth

- `POST /api/auth/oauth/google` - Google OAuth login
- `POST /api/auth/oauth/github` - GitHub OAuth login

## Frontend Components

The system includes ready-to-use React components:

- `LoginForm` - Complete login form with validation
- `SignupForm` - Registration form with GDPR/FERPA consent
- `PasswordResetForm` - Password reset functionality
- `ProtectedRoute` - Route protection wrapper
- `AuthContext` - Authentication state management

## Usage Examples

### Protecting a Page

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute requireEmailVerification>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Using Authentication Context

```tsx
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiry**: Access tokens expire in 15 minutes
4. **Rate Limiting**: Configure appropriate rate limits
5. **Audit Logs**: Monitor authentication events
6. **Password Policy**: Enforce strong password requirements
7. **Email Verification**: Require email verification for new accounts

## Compliance Features

### FERPA Compliance

- Student data protection
- Consent tracking for educational data sharing
- Audit logs for data access

### GDPR Compliance

- Granular consent options
- Data portability
- Right to be forgotten
- Consent withdrawal

## Monitoring and Logging

The system includes comprehensive audit logging:

- Login/logout events
- Password changes
- Email verifications
- OAuth logins
- Failed authentication attempts
- Account lockouts

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correct
2. **OAuth Redirects**: Check redirect URIs match exactly
3. **Email Delivery**: Verify SendGrid configuration
4. **Token Expiry**: Check JWT secrets are set correctly

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=auth:*
```

## Production Deployment

1. Use strong, unique secrets for JWT and NextAuth
2. Set up proper CORS policies
3. Configure rate limiting for your traffic
4. Set up monitoring for authentication events
5. Use a secure database connection
6. Enable HTTPS only
7. Set up proper backup strategies

## Support

For issues or questions about the authentication system, please refer to the documentation or contact the development team.

# Security Guidelines for MileStack

## 🚨 CRITICAL: Environment Variables Security

### What Happened
- `.env.local` file with API keys was accidentally committed to git history
- This exposed sensitive API keys and database credentials
- **IMMEDIATE ACTION TAKEN**: File removed from entire git history using `git filter-repo`

### Prevention Measures

#### 1. Environment Files Protection
The following files are **NEVER** to be committed to git:
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `.env.*.local`

#### 2. Pre-commit Checks
Before committing, always run:
```bash
# Check for environment files
git status | grep -E "\.env"

# If any .env files show up, DO NOT COMMIT
```

#### 3. Environment Variables Setup
Use `.env.example` files to document required variables:
```bash
# Copy example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

#### 4. API Key Management
- **NEVER** hardcode API keys in source code
- **NEVER** commit `.env` files
- Use environment variables for all sensitive data
- Rotate API keys if accidentally exposed

### Current Environment Variables Required

#### Database
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/milestack"
```

#### AI Services
```bash
GEMINI_API_KEY="your_gemini_api_key_here"
```

#### Next.js
```bash
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

#### OAuth (Optional)
```bash
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### Security Checklist

Before every commit:
- [ ] No `.env` files in `git status`
- [ ] No hardcoded API keys in source code
- [ ] All sensitive data uses environment variables
- [ ] `.gitignore` includes all environment file patterns

### If You Accidentally Commit Sensitive Data

1. **IMMEDIATELY** remove from tracking:
   ```bash
   git rm --cached .env.local
   ```

2. Remove from git history:
   ```bash
   git filter-repo --path .env.local --invert-paths --force
   ```

3. **ROTATE** all exposed API keys immediately

4. Update `.gitignore` to prevent future commits

### Emergency Response

If API keys are exposed:
1. **IMMEDIATELY** rotate all exposed keys
2. Check API usage logs for unauthorized access
3. Update all environment files with new keys
4. Notify team members to update their local environment files

## 🔒 Additional Security Measures

### Code Security
- Use TypeScript for type safety
- Validate all user inputs
- Implement proper error handling
- Use HTTPS in production

### Database Security
- Use connection pooling
- Implement proper authentication
- Regular security updates
- Backup encryption

### API Security
- Rate limiting
- Input validation
- CORS configuration
- Authentication middleware

## 📞 Security Contacts

For security issues or questions:
- Create a private issue in the repository
- Contact the development team immediately
- Do not discuss security issues in public channels

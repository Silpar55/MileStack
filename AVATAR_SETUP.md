# Avatar System Setup Guide

This guide explains how to set up the profile picture system with both local storage and Cloudinary integration.

## Features

- ✅ **Local File Storage**: Images stored in `/public/uploads/avatars/`
- ✅ **Cloudinary Integration**: Production-ready cloud storage and processing
- ✅ **Automatic OAuth Avatar Download**: Downloads and stores avatars from Google, GitHub, etc.
- ✅ **Image Processing**: Automatic resizing, cropping, and optimization
- ✅ **Drag & Drop Upload**: Modern UX with preview and validation
- ✅ **Fallback Support**: Graceful degradation when services are unavailable

## Environment Variables

### For Local Development (Optional)

No additional environment variables needed. Images will be stored locally in the `public/uploads/avatars/` directory.

### For Production with Cloudinary (Recommended)

Add these environment variables to your `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Getting Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy the following values:
   - **Cloud Name**: Found in the dashboard URL or "Cloud name" field
   - **API Key**: Found in the "API Key" field
   - **API Secret**: Found in the "API Secret" field

## File Structure

```
public/
├── uploads/
│   └── avatars/
│       ├── profile_[userId]_[timestamp]_[uuid].jpg
│       └── thumb_profile_[userId]_[timestamp]_[uuid].jpg
└── oauth-avatars/
    ├── google/
    ├── github/
    ├── facebook/
    └── twitter/
```

## API Endpoints

### Upload Avatar

```http
POST /api/profile/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- avatar: File (image file)
```

### Delete Avatar

```http
DELETE /api/profile/upload-avatar
Authorization: Bearer <token>
```

## Image Processing

- **Profile Picture**: 300x300px, JPEG, 85% quality
- **Thumbnail**: 150x150px, JPEG, 80% quality
- **Supported Formats**: JPEG, PNG, WebP
- **Maximum Size**: 5MB
- **Auto-crop**: Square format with center crop
- **Optimization**: Automatic format conversion and compression

## OAuth Integration

The system automatically downloads and stores avatars from OAuth providers:

- **Google**: Uses `picture` field from profile
- **GitHub**: Uses `avatar_url` field from profile
- **Facebook**: Uses `picture.data.url` field from profile
- **Twitter**: Uses `profile_image_url_https` field from profile

## Usage in Components

```tsx
import { AvatarUpload } from "@/components/ui/avatar-upload";

<AvatarUpload
  currentAvatar={profileData.profilePicture}
  currentName={profileData.name}
  onUpload={handleAvatarUpload}
  onDelete={handleAvatarDelete}
  disabled={isLoading}
/>;
```

## Database Schema

The following fields have been added to the `users` table:

```sql
profilePicture TEXT,                    -- URL or path to profile picture
profilePictureProvider VARCHAR(20),     -- 'local', 'cloudinary', 'oauth'
oauthAvatarUrl TEXT                     -- Original OAuth avatar URL
```

## Error Handling

The system includes comprehensive error handling:

- **File Validation**: Type, size, and format validation
- **Upload Failures**: Graceful fallback to local storage
- **Network Issues**: OAuth avatar download failures don't block signup
- **Storage Issues**: Automatic cleanup of failed uploads

## Performance Considerations

- **Lazy Loading**: Images are loaded only when needed
- **CDN Integration**: Cloudinary provides global CDN
- **Optimization**: Multiple image sizes and formats
- **Caching**: Browser caching headers set appropriately

## Security

- **File Type Validation**: Only image files allowed
- **Size Limits**: 5MB maximum file size
- **Authentication**: All uploads require valid JWT token
- **Path Sanitization**: Safe file naming and storage paths

## Troubleshooting

### Images Not Displaying

1. Check if Cloudinary is properly configured
2. Verify file permissions in `/public/uploads/`
3. Check browser network tab for 404 errors

### Upload Failures

1. Verify JWT token is valid
2. Check file size (must be < 5MB)
3. Ensure file is a valid image format

### OAuth Avatars Not Downloading

1. Check OAuth provider permissions
2. Verify avatar URL is accessible
3. Check network connectivity
4. Review server logs for download errors

## Migration from Existing System

If you have existing avatars in a different format:

1. Run the database migration to add new fields
2. Update existing avatar URLs to use new format
3. Test upload functionality
4. Update any hardcoded avatar references

## Production Deployment

1. Set up Cloudinary account and get credentials
2. Add environment variables to production environment
3. Test upload functionality in production
4. Monitor storage usage and costs
5. Set up Cloudinary webhook notifications (optional)

## Cost Considerations

### Local Storage

- **Free**: No additional costs
- **Limitations**: Server storage space, no CDN

### Cloudinary

- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Paid Plans**: Based on usage (storage + bandwidth + transformations)
- **Benefits**: Global CDN, automatic optimization, multiple formats

Choose based on your expected usage and performance requirements.

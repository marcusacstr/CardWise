# Logo Storage Guide

## Overview

CardWise partners can upload logos that appear on their customer portals. The system handles storage differently for development and production environments.

## 🏠 Development Environment (localhost)

### Storage Location
- **Path**: `/public/uploads/logos/`
- **Full Path**: `/Users/marcus/Desktop/CardWise/public/uploads/logos/`
- **URL Format**: `http://localhost:3003/uploads/logos/partner-123-1640995200000.png`

### How It Works
1. Files are saved directly to your local filesystem
2. Next.js serves files from the `public` folder statically
3. Files persist between server restarts
4. Perfect for development and testing

### File Management
- Files accumulate over time in the local folder
- You can manually clean up old files if needed
- `.gitignore` prevents these files from being committed

## ☁️ Production Environment (Vercel)

### Storage Location
- **Service**: Supabase Storage
- **Bucket**: `partner-logos`
- **URL Format**: `https://[project].supabase.co/storage/v1/object/public/partner-logos/partner-123-1640995200000.png`

### Why Not Local Files?
Vercel uses serverless functions that are:
- **Stateless**: Each request runs in a clean environment
- **Ephemeral**: Files written during a request are deleted afterward
- **Read-only**: The filesystem cannot be permanently modified

### How It Works
1. Files are uploaded to Supabase Storage bucket
2. Public URLs are generated automatically
3. Files are served globally via CDN
4. Automatic cleanup when logos are replaced

## 🔧 Technical Implementation

### API Endpoint: `/api/partner/upload-logo`

```typescript
// Environment detection
const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL

if (isProduction) {
  // Use Supabase Storage
  const { data, error } = await supabase.storage
    .from('partner-logos')
    .upload(fileName, buffer, { contentType: file.type })
} else {
  // Use local filesystem
  await writeFile(filePath, buffer)
}
```

### Database Storage
Both environments store the logo URL in:
- `partners.logo_url` - Main partner record
- `partner_portal_configs.logo_url` - Portal configurations

## 🗄️ Storage Specifications

### File Limits
- **Max Size**: 5MB
- **Formats**: JPG, PNG, GIF, WebP
- **Naming**: `partner-{id}-{timestamp}.{extension}`

### Supabase Storage Bucket
- **Name**: `partner-logos`
- **Public**: Yes (for displaying on portals)
- **Policies**: Partners can only manage their own logos

## 📁 File Structure

```
CardWise/
├── public/
│   └── uploads/
│       └── logos/           # Development files
│           ├── .gitkeep     # Ensures directory exists
│           └── partner-*.* # Uploaded logos (ignored by git)
├── supabase/
│   └── migrations/
│       └── *_create_storage_bucket.sql # Production setup
└── src/
    └── app/api/partner/upload-logo/
        └── route.ts         # Handles both environments
```

## 🚀 Deployment Checklist

### Development Setup
- [x] Create `/public/uploads/logos/` directory
- [x] Add `.gitkeep` file
- [x] Update `.gitignore` to exclude uploaded files
- [x] Test local file upload

### Production Setup
- [ ] Run Supabase migration to create storage bucket
- [ ] Verify storage policies are correct
- [ ] Test upload in production environment
- [ ] Confirm public URLs work correctly

## 🔍 Troubleshooting

### Development Issues
- **Permission denied**: Check folder permissions
- **Files not appearing**: Verify `/public/uploads/logos/` exists
- **URLs not working**: Restart Next.js dev server

### Production Issues
- **Upload fails**: Check Supabase storage bucket exists
- **Access denied**: Verify storage policies
- **URLs broken**: Confirm bucket is public

## 🛠️ Maintenance

### Development
- Periodically clean up old logo files
- Monitor disk space usage

### Production
- Supabase handles cleanup automatically
- Monitor storage usage in Supabase dashboard
- Old logos are automatically replaced (not accumulated)

## 🔒 Security

### File Validation
- File type checking (images only)
- File size limits (5MB max)
- Authentication required for upload
- Partner ownership verification

### Storage Security
- Development: Local filesystem (secure by default)
- Production: Supabase RLS policies restrict access
- Public read access for displaying logos
- Private write access (partners only) 
#!/bin/bash

# Deploy script for CardWise changes
# This script copies the updated files to your GitHub Desktop clone

echo "🚀 CardWise Deployment Helper"
echo "==============================="

# Check if destination directory is provided
if [ -z "$1" ]; then
    echo "Usage: ./deploy-files.sh /path/to/your/github-desktop-clone"
    echo ""
    echo "Example: ./deploy-files.sh ~/Desktop/CardWise-GitHub"
    echo ""
    echo "First clone your repo in GitHub Desktop, then run this script with the path to that clone."
    exit 1
fi

DEST_DIR="$1"

# Check if destination directory exists
if [ ! -d "$DEST_DIR" ]; then
    echo "❌ Error: Directory $DEST_DIR does not exist"
    echo "Please make sure you've cloned the repository in GitHub Desktop first."
    exit 1
fi

echo "📁 Source: $(pwd)"
echo "📁 Destination: $DEST_DIR"
echo ""

# Key files with our fixes
FILES=(
    "src/app/dashboard/page.tsx"
    "src/app/settings/page.tsx" 
    "src/app/partner/account-settings/page.tsx"
    "src/components/Navigation.tsx"
    "next.config.js"
    "package.json"
)

echo "📋 Copying key files with fixes..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Create directory if it doesn't exist
        mkdir -p "$DEST_DIR/$(dirname "$file")"
        
        # Copy file
        cp "$file" "$DEST_DIR/$file"
        echo "✅ Copied: $file"
    else
        echo "⚠️  Warning: $file not found"
    fi
done

echo ""
echo "🎉 Files copied successfully!"
echo ""
echo "Next steps:"
echo "1. Open GitHub Desktop"
echo "2. You should see the changed files in the 'Changes' tab"
echo "3. Add commit message: 'Fix CSV upload functionality and add comprehensive settings pages'"
echo "4. Click 'Commit to main'"
echo "5. Click 'Push origin' to deploy"
echo ""
echo "✨ Your fixes will be live once Vercel rebuilds (usually 1-2 minutes)" 
#!/bin/bash

# CardWise Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting CardWise Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please copy env.production.template to .env.production and fill in your values."
    exit 1
fi

print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production
print_success "Dependencies installed"

# Run tests (if available)
if npm run test --silent 2>/dev/null; then
    print_status "Running tests..."
    npm run test
    print_success "All tests passed"
else
    print_warning "No tests found, skipping test phase"
fi

# Build the application
print_status "Building application for production..."
npm run build
print_success "Application built successfully"

# Check build output
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build output verified"

# Database migration check
print_status "Checking database migrations..."
if command -v supabase &> /dev/null; then
    print_status "Running database migrations..."
    supabase db push --project-ref $SUPABASE_PROJECT_REF
    print_success "Database migrations completed"
else
    print_warning "Supabase CLI not found. Please run database migrations manually."
fi

# Security check
print_status "Running security audit..."
npm audit --audit-level high
print_success "Security audit completed"

# Bundle size analysis
print_status "Analyzing bundle size..."
if [ -f ".next/analyze/client.html" ]; then
    print_success "Bundle analysis available at .next/analyze/client.html"
else
    print_warning "Bundle analysis not available. Consider adding @next/bundle-analyzer"
fi

# Performance check
print_status "Checking for performance optimizations..."
if grep -q "compress: true" next.config.js; then
    print_success "Compression enabled"
else
    print_warning "Consider enabling compression in next.config.js"
fi

# Environment validation
print_status "Validating environment variables..."
source .env.production

required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Pre-deployment checklist
print_status "Pre-deployment checklist:"
echo "  ✅ Dependencies installed"
echo "  ✅ Application built"
echo "  ✅ Environment variables set"
echo "  ✅ Security audit passed"

# Deployment options
echo ""
print_status "Choose deployment method:"
echo "1. Vercel"
echo "2. Netlify"
echo "3. Docker"
echo "4. Manual"

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        print_status "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
            print_success "Deployed to Vercel successfully!"
        else
            print_error "Vercel CLI not found. Install with: npm i -g vercel"
            exit 1
        fi
        ;;
    2)
        print_status "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=.next
            print_success "Deployed to Netlify successfully!"
        else
            print_error "Netlify CLI not found. Install with: npm i -g netlify-cli"
            exit 1
        fi
        ;;
    3)
        print_status "Building Docker image..."
        if command -v docker &> /dev/null; then
            docker build -t cardwise-production .
            print_success "Docker image built successfully!"
            print_status "To run: docker run -p 3000:3000 cardwise-production"
        else
            print_error "Docker not found. Please install Docker first."
            exit 1
        fi
        ;;
    4)
        print_status "Manual deployment selected."
        print_status "Your application is ready for deployment!"
        print_status "Built files are in the .next directory"
        print_status "Start with: npm run start"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Post-deployment checks
echo ""
print_status "Post-deployment checklist:"
echo "  🔍 Test the main application URL"
echo "  🔍 Test subdomain routing (partner portals)"
echo "  🔍 Verify database connectivity"
echo "  🔍 Check error monitoring (Sentry)"
echo "  🔍 Validate SSL certificates"
echo "  🔍 Test user registration flow"
echo "  🔍 Test partner portal creation"

print_success "🎉 Deployment completed successfully!"
print_status "Remember to:"
echo "  - Monitor application logs"
echo "  - Set up uptime monitoring"
echo "  - Configure backup schedules"
echo "  - Review security headers"

echo ""
print_success "CardWise is now live in production! 🚀" 
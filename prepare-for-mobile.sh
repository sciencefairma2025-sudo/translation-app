#!/bin/bash

# Script to prepare the app for mobile deployment

echo "📱 Preparing Translation App for Mobile Deployment"
echo "=================================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")"

# Check if key.json exists
if [ ! -f "key.json" ]; then
    echo "⚠️  WARNING: key.json not found!"
    echo "   You need to download your Google Cloud service account key"
    echo "   and save it as 'key.json' in this directory."
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the React app
echo "🔨 Building React app for production..."
cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

cd ..
echo "✅ Build complete!"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. DEPLOY TO RAILWAY (Recommended):"
echo "   - Go to https://railway.app"
echo "   - Sign up and create new project"
echo "   - Connect your GitHub repo"
echo "   - Upload key.json or set GOOGLE_APPLICATION_CREDENTIALS"
echo "   - Deploy!"
echo ""
echo "2. OR USE NGROK FOR QUICK TESTING:"
echo "   - Install: brew install ngrok"
echo "   - Sign up at https://dashboard.ngrok.com"
echo "   - Run: ngrok http 3000"
echo "   - Use the HTTPS URL on your phone"
echo ""
echo "3. ACCESS ON IPHONE:"
echo "   - Open Safari"
echo "   - Go to your HTTPS URL"
echo "   - Tap Share → Add to Home Screen"
echo "   - Grant microphone permission"
echo ""
echo "For detailed instructions, see MOBILE_SETUP.md"
echo ""



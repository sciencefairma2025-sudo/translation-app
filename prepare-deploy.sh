#!/bin/bash

# Script to prepare the app for deployment
# This checks everything is ready before deploying

echo "🚀 Preparing Translation App for Deployment..."
echo ""

# Check if key.json exists
if [ ! -f "key.json" ]; then
    echo "❌ key.json not found!"
    echo "   Please make sure your Google Cloud key file is in the project root"
    exit 1
fi
echo "✅ key.json found"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found, creating it..."
    echo "GOOGLE_APPLICATION_CREDENTIALS=./key.json" > .env
    echo "PORT=3001" >> .env
    echo "✅ Created .env file"
else
    echo "✅ .env file exists"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Root node_modules not found"
    echo "   Run: npm install"
    exit 1
fi
echo "✅ Root dependencies installed"

if [ ! -d "client/node_modules" ]; then
    echo "⚠️  Client node_modules not found"
    echo "   Run: cd client && npm install"
    exit 1
fi
echo "✅ Client dependencies installed"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized"
    echo "   Initializing git..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository found"
fi

# Create/update .gitignore
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
client/node_modules/
.env
key.json
*.log
.DS_Store
build/
client/build/
server-debug.log
errors.log
EOF
    echo "✅ Created .gitignore"
else
    echo "✅ .gitignore exists"
fi

# Check if client can build
echo ""
echo "🔨 Testing if client can build..."
cd client
if npm run build > /dev/null 2>&1; then
    echo "✅ Client builds successfully"
    cd ..
else
    echo "❌ Client build failed!"
    echo "   Fix build errors before deploying"
    cd ..
    exit 1
fi

echo ""
echo "✅ Everything looks good!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit your code:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Railway:"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub repo"
echo "   - Add environment variables (see DEPLOY_NOW.md)"
echo ""
echo "📱 See DEPLOY_NOW.md for detailed deployment instructions!"


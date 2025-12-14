#!/bin/bash

# Installation script for translation-app dependencies
# Run this after npm is installed

echo "Installing dependencies for translation-app..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo ""
    echo "Please install npm first by running:"
    echo "  source ~/.zshrc"
    echo "  nvm install --lts"
    echo "  nvm use --lts"
    exit 1
fi

echo "npm version: $(npm --version)"
echo "node version: $(node --version)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Or start server and client separately:"
echo "  npm run dev:server    # Start server only"
echo "  npm run dev:client    # Start client only"




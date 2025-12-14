#!/bin/bash

# Script to capture server errors and save to a file
# Run this after npm is installed and you start the server

echo "📝 Error capture script"
echo "This script will capture server output to errors.log"
echo ""
echo "After running this, start your server with:"
echo "  npm run dev 2>&1 | tee errors.log"
echo ""
echo "Or use this script to capture output:"
echo "  ./capture-errors.sh"
echo ""

# Create the log file
LOG_FILE="errors.log"
echo "Server errors will be saved to: $LOG_FILE"
echo ""

# Check if server is running
if pgrep -f "node.*server" > /dev/null; then
    echo "⚠️  Server appears to be running"
    echo "Attaching to running server output..."
    echo ""
fi

echo "Starting server and capturing output..."
echo "Press Ctrl+C to stop"
echo ""
echo "=" >> $LOG_FILE
echo "Server started at: $(date)" >> $LOG_FILE
echo "=" >> $LOG_FILE

# Run server and capture all output
npm run dev 2>&1 | tee -a $LOG_FILE

echo ""
echo "Output saved to $LOG_FILE"
echo "You can share this file or its contents with me for debugging"




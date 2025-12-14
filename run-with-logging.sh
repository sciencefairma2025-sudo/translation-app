#!/bin/bash

# Script to run the server with full logging that I can read
# This captures ALL output to a log file

LOG_FILE="server-debug.log"

echo "🚀 Starting server with full logging..."
echo "📝 All output will be saved to: $LOG_FILE"
echo "📊 I can read this file to see any errors"
echo ""
echo "To stop the server, press Ctrl+C"
echo ""

# Clear previous log
> "$LOG_FILE"

# Run the server and capture ALL output (stdout and stderr)
# Using unbuffered output so errors appear immediately
npm run dev 2>&1 | tee -a "$LOG_FILE"

echo ""
echo "Server stopped. Log saved to $LOG_FILE"




#!/bin/bash

# Real-time error monitoring script
# This will watch for errors as you use the translation app

echo "🔍 Monitoring for errors..."
echo "This script will show any errors that occur in real-time"
echo "Use the translation app and watch this terminal for errors"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Watch the errors.log file for new entries
if [ -f "errors.log" ]; then
    tail -f errors.log | grep --line-buffered -i -E "error|failed|exception|warning|❌|⚠️" --color=always
else
    echo "⚠️  errors.log not found. Starting server with monitoring..."
    echo ""
    npm run dev 2>&1 | tee -a errors.log | grep --line-buffered -i -E "error|failed|exception|warning|❌|⚠️" --color=always
fi




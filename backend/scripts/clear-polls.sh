#!/bin/bash

# Clear all active polls from the database (development only)
# This helps when a poll is stuck and blocking new polls from being created

echo "🧹 Clearing active polls..."

curl -X POST http://localhost:5000/api/polls/admin/clear-active \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "✅ Done!"

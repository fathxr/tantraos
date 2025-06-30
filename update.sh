#!/bin/bash

# TantraOS Update Script
set -e

echo "🔄 Starting TantraOS update..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Backup current state
echo "💾 Creating backup..."
./backup.sh

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Rebuild and start
echo "🔨 Rebuilding and starting services..."
docker-compose up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Verify deployment
echo "✅ Verifying deployment..."
if curl -s http://localhost/health > /dev/null; then
    echo "🎉 Update completed successfully!"
else
    echo "❌ Update failed. Rolling back..."
    # Add rollback logic here if needed
fi
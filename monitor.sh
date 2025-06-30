#!/bin/bash

# TantraOS Monitoring Script
set -e

echo "📊 TantraOS System Status"
echo "========================"

# Check container status
echo "🐳 Container Status:"
docker-compose ps

echo ""

# Check disk usage
echo "💾 Disk Usage:"
df -h

echo ""

# Check memory usage
echo "🧠 Memory Usage:"
free -h

echo ""

# Check application health
echo "🏥 Application Health:"
curl -s http://localhost/health | jq '.' || echo "Health check failed"

echo ""

# Check recent logs for errors
echo "🚨 Recent Errors:"
docker-compose logs --tail=50 | grep -i error || echo "No recent errors found"

echo ""

# Check database connection
echo "🗄️ Database Status:"
docker exec tantraos-mysql mysqladmin -u root -p$DB_ROOT_PASSWORD ping || echo "Database connection failed"

echo ""

# Check Redis status
echo "🔴 Redis Status:"
docker exec tantraos-redis redis-cli ping || echo "Redis connection failed"
#!/bin/bash

# TantraOS Backup Script
set -e

BACKUP_DIR="/backups/tantraos"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="tantraos_backup_$DATE.tar.gz"

echo "🔄 Starting TantraOS backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "📊 Backing up database..."
docker exec tantraos-mysql mysqldump -u root -p$DB_ROOT_PASSWORD tantraos > $BACKUP_DIR/database_$DATE.sql

# Backup uploads
echo "📁 Backing up uploads..."
cp -r uploads $BACKUP_DIR/uploads_$DATE

# Backup logs
echo "📝 Backing up logs..."
cp -r logs $BACKUP_DIR/logs_$DATE

# Create compressed archive
echo "🗜️ Creating compressed backup..."
tar -czf $BACKUP_DIR/$BACKUP_FILE -C $BACKUP_DIR database_$DATE.sql uploads_$DATE logs_$DATE

# Cleanup temporary files
rm -rf $BACKUP_DIR/database_$DATE.sql $BACKUP_DIR/uploads_$DATE $BACKUP_DIR/logs_$DATE

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "tantraos_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_FILE"
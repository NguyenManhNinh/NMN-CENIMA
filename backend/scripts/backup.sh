#!/bin/bash
# ===================================
# NMN CINEMA - DATABASE BACKUP SCRIPT
# ===================================
# Usage: ./scripts/backup.sh
#
# Requirements:
# - mongodump installed (part of MongoDB Tools)
# - .env file with MONGO_URI

set -e

# Load environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Variables
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="nmn_cinema_${DATE}"

echo "╔════════════════════════════════════════════╗"
echo "║      NMN CINEMA - DATABASE BACKUP          ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Starting backup..."
echo "   Database: datn-cinema"
echo "   Output: ${BACKUP_DIR}/${BACKUP_NAME}"
echo ""

# Run mongodump
if [ -n "$MONGO_URI" ]; then
  mongodump --uri="$MONGO_URI" --out="${BACKUP_DIR}/${BACKUP_NAME}"
else
  mongodump --db=datn-cinema --out="${BACKUP_DIR}/${BACKUP_NAME}"
fi

# Compress backup
echo ""
echo "🗜️  Compressing backup..."
cd $BACKUP_DIR
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"

echo ""
echo "✅ Backup completed!"
echo "   File: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo ""

# List recent backups
echo "📁 Recent backups:"
ls -lh *.tar.gz 2>/dev/null | tail -5

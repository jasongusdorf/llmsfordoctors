#!/bin/bash
# Daily SQLite backup to S3-compatible storage
set -e
DATE=$(date +%Y-%m-%d)
sqlite3 /data/auth.db ".backup /data/backup-${DATE}.db"
# Upload to Tigris S3 (configure AWS_* env vars in Fly secrets)
if command -v aws &> /dev/null; then
  aws s3 cp "/data/backup-${DATE}.db" "s3://llmsfordoctors-backups/auth-${DATE}.db"
  rm "/data/backup-${DATE}.db"
  echo "Backup uploaded: auth-${DATE}.db"
else
  echo "AWS CLI not available, backup saved locally: /data/backup-${DATE}.db"
fi

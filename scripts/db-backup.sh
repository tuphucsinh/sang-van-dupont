#!/usr/bin/env bash
# db-backup.sh — Backup thủ công Supabase DB (Free không có auto-backup)
# Usage: scripts/db-backup.sh [keep]
#   keep: số bản giữ lại (default 7). Backup ra /home/pi5/hermes-artifacts/sangdupont-db/
# Yêu cầu: supabase CLI trong PATH + project đã link (supabase/ dir)
set -euo pipefail

KEEP="${1:-7}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="/home/pi5/hermes-artifacts/sangdupont-db"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/sangdupont_$STAMP.sql"

mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR"

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERR: supabase CLI khong co trong PATH" >&2
  exit 1
fi

# Dump schema + data qua Management API (--linked dùng token access-token, không cần DB password)
supabase db dump --linked --data-only > "$OUT" 2>/dev/null || {
  # fallback: dump schema+data nếu --data-only chưa hỗ trợ flag tương tự
  supabase db dump --linked > "$OUT" 2>/dev/null || {
    echo "ERR: dump that bai" >&2
    rm -f "$OUT"
    exit 1
  }
}

SIZE="$(du -h "$OUT" | cut -f1)"
echo "BACKUP_OK: $OUT ($SIZE)"

# Giữ KEEP bản mới nhất, xóa cũ
ls -1t "$BACKUP_DIR"/sangdupont_*.sql 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "$old"
  echo "pruned: $old"
done
exit 0

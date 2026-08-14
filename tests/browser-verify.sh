#!/usr/bin/env bash
# tests/browser-verify.sh — Browser verify chuẩn cho static SPA (thêm 2026-08-11, anh duyệt)
#
# Usage:
#   tests/browser-verify.sh <assert.mjs> [url] [user-data-dir]
#
#   <assert.mjs>    Node script đọc DOM từ biến môi trường WD_DOM (html string),
#                   in ra PASS/FAIL từng check, exit 0 = PASS, exit 1 = FAIL.
#                   VD: const d = process.env.WD_DOM; if (!d.includes('id="map"')) process.exit(1);
#   [url]           Mặc định: http://localhost:8080/
#   [user-data-dir] Mặc định: /tmp/wd-browser-verify (xóa trước mỗi lần chạy)
#
# Yêu cầu: /usr/bin/google-chrome-stable (Chrome thật, KHÔNG dùng Chromium Debian)
#          node >= 18 (hỗ trợ process.env + --input-type=module nếu cần)
#
# Lưu ý: server phải chạy sẵn (VD: python3 -m http.server 8080 --bind 0.0.0.0)
#        nếu URL là http(s). Với file:// không cần server.

set -euo pipefail

ASSERT="${1:-}"
URL="${2:-http://localhost:8080/}"
PROFILE="${3:-/tmp/wd-browser-verify}"
DOM_FILE="$(mktemp /tmp/wd-browser-dom.XXXXXX.html)"
LOG_FILE="$(mktemp /tmp/wd-browser-cons.XXXXXX.log)"

if [[ -z "$ASSERT" ]]; then
  echo "❌ Thiếu assert script. Usage: tests/browser-verify.sh <assert.mjs> [url]" >&2
  exit 2
fi
if [[ ! -f "$ASSERT" ]]; then
  echo "❌ Assert script không tồn tại: $ASSERT" >&2
  exit 2
fi
if [[ ! -x /usr/bin/google-chrome-stable ]]; then
  echo "❌ Không tìm thấy /usr/bin/google-chrome-stable (cần Chrome thật)" >&2
  exit 2
fi

rm -rf "$PROFILE"

timeout 60 /usr/bin/google-chrome-stable \
  --headless=new --no-sandbox --disable-gpu \
  --virtual-time-budget=20000 \
  --user-data-dir="$PROFILE" \
  --dump-dom "$URL" > "$DOM_FILE" 2> "$LOG_FILE" || {
  echo "❌ Chrome chạy lỗi (exit $?)" >&2
  tail -n 20 "$LOG_FILE" >&2
  rm -f "$DOM_FILE" "$LOG_FILE"
  rm -rf "$PROFILE"
  exit 1
}

# Console error check (SEVERE / Uncaught)
if grep -qiE "SEVERE|Uncaught|TypeError|ReferenceError" "$LOG_FILE"; then
  echo "❌ Console có lỗi nghiêm trọng:" >&2
  grep -iE "SEVERE|Uncaught|TypeError|ReferenceError" "$LOG_FILE" | head -n 10 >&2
  rm -f "$DOM_FILE" "$LOG_FILE"
  rm -rf "$PROFILE"
  exit 1
fi

export WD_DOM="$(cat "$DOM_FILE")"
if node "$ASSERT"; then
  echo "✅ Browser verify PASS: $(basename "$ASSERT")"
  rm -f "$DOM_FILE" "$LOG_FILE"
  rm -rf "$PROFILE"
  exit 0
else
  echo "❌ Browser verify FAIL: $(basename "$ASSERT")" >&2
  rm -f "$DOM_FILE" "$LOG_FILE"
  rm -rf "$PROFILE"
  exit 1
fi

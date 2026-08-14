# OPERATIONS — SangDupont Website Operator Playbook (Phase 12)

> Nguồn: kế hoạch §Rollback + MASTER_PLAN P7 (rollback 3 đường) + AGENTS.md.
> Áp dụng cho: Hermes nội bộ (profile `sangbot`, qua Telegram) + Mika khi vận hành.

## 1. Workflow chuẩn

```text
Hermes (Pi5, project local /home/pi5/projects/Sangwebsite)
    ↓ commit (1 task = 1 commit)
GitHub main
    ↓ push (CHỈ KHI ANH DUYỆT)
GitHub Actions build/lint/test
    ↓ PASS
Vercel auto-deploy (git integration)
    ↓
Post-deploy check (smoke + sitemap + route)
```

**Guard cứng**: `push` / `deploy` (`vercel --prod`) / `delete` (dữ liệu) = **chờ anh duyệt qua Telegram**. Mọi write có log (`.tmp/ops.log`).

## 2. Checklist post-deploy (chạy sau mỗi deploy)

| # | Kiểm tra | Lệnh (sangops) | PASS khi |
|---|---|---|---|
| 1 | Build CI xanh | `sangops ci` (gh run view) | run = success, không job fail |
| 2 | Production live | `sangops smoke` | 17 routes 200, 404 chuẩn, NO_JS_ERRORS |
| 3 | Sitemap/robots | `sangops smoke` | sitemap.xml 200 + đủ URL, robots disallow /admin |
| 4 | Nội dung VI/EN | `sangops i18n` | không lệch đáng kể |
| 5 | Link/ảnh hỏng | `sangops links` | 0 broken |
| 6 | SEO cơ bản | `sangops seo` | không cảnh báo nghiêm trọng |
| 7 | Kênh khách | click thử nút Chat tư vấn → widget AI mở | widget hoạt động |

Không PASS 1 mục → KHÔNG coi là deploy thành công; xử lý theo mục 3.

## 3. Deploy lỗi → phân loại nguyên nhân

1. **Thu bằng chứng vận hành thật** (không đoán): log GH Actions (`gh run view <id> --log-failed`), trạng thái Vercel, HTTP status production, console browser.
2. Phân loại:
   - **Build lỗi** (compile/lint/test trong CI) → fix code local → commit → chờ anh duyệt push.
   - **Deploy lỗi** (Vercel fail/cấu hình) → đọc log Vercel, sửa config/build → redeploy.
   - **Runtime lỗi** (site 200 nhưng JS lỗi / route 500 / widget hỏng) → smoke + console CDP xác định trang → fix.
   - **Data lỗi** (nội dung/ảnh hỏng) → `sangops i18n`/`links`/DB check → sửa data qua `sangops products update` (không phải code).
3. Báo anh: **nguyên nhân + bằng chứng + đề xuất** (fix hay rollback).

## 4. Rollback — 3 đường (chọn theo loại lỗi)

| Đường | Khi nào | Cách làm | Approval |
|---|---|---|---|
| **A. Git revert** | Lỗi từ commit mới (code/content) | `git revert <bad_sha>` (giữ lịch sử) → build local → push | Anh duyệt push |
| **B. Redeploy artifact/tag cũ** | Deploy mới hỏng, cần về đúng bản cũ ngay | `vercel --prod` lại bản `out/` cũ / tag `v1.0-release-a` (giữ artifact trước khi deploy mới — luôn lưu `out/` cũ trước khi publish) | Anh duyệt deploy |
| **C. Restore DB** | Lỗi data (xóa nhầm, sai giá) | backup thủ công `scripts/db-backup.sh` / backup cron CN 08:00 (giữ 7 bản) → restore | Anh duyệt + backup mới trước khi restore |

**Quy tắc**: trước mọi write quan trọng (delete/update hàng loạt/migration) → backup DB trước. Migration phải backward-compatible khi có thể (kế hoạch §590).

## 5. Bảo mật vận hành

- Service role key: chỉ trong `.env.local` (chmod 600, gitignored) — KHÔNG in ra chat/log.
- Sangbot: chỉ anh (Telegram 6903033581) được chat — allowlist đã chặn user khác.
- Deploy hook/secret: ở env, không vào git.
- Mọi thay đổi production qua operator: log vào `.tmp/ops.log` (timestamp + lệnh + kết quả).

## 6. Nguyên tắc chung

- Nghi ngờ → thu bằng chứng thật trước khi kết luận (2-Strike rule AGENTS.md).
- Không tự ý mở rộng scope; đề xuất thì báo anh.
- Push/deploy/delete — luôn 3 chữ: **hỏi anh trước**.

## 7. Command map (anh nhắn sangbot → lệnh)

| Anh nhắn | Lệnh (trong `/home/pi5/projects/Sangwebsite`) |
|---|---|
| "sinh marketing cho <slug>" | `npm run marketing -- <slug>` → báo draft, chờ duyệt publish |
| "check site" / "kiểm tra website" | `npm run ops -- smoke` |
| "audit seo" | `npm run ops -- seo` |
| "kiểm tra VI/EN" | `npm run ops -- i18n` |
| "check link/ảnh hỏng" | `npm run ops -- links` |
| "thêm/sửa sản phẩm" | `npm run ops -- products create\|update <json>` |
| "xóa sản phẩm <slug>" | `npm run ops -- products delete <slug> <slug>` — delete = GUARD |
| "xem sản phẩm" | `npm run ops -- products list` |
| "theo dõi CI" | `npm run ops -- ci` (gh cần auth) |
| "publish / deploy" | `npm run ops -- publish --confirm` — CHỈ khi anh duyệt |
| "rollback" | `npm run ops -- rollback` (dry-run) → đề xuất → chờ duyệt |

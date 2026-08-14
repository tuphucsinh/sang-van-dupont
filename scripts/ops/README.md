# sangops — Website Operator CLI (SangDupont)

CLI vận hành website cho Hermes nội bộ (profile `sangbot` qua Telegram) và Mika.

## Dùng

```bash
npm run ops -- <cmd> [args]      # = npx tsx scripts/ops/sangops.ts <cmd> [args]
npm run ops -- --help
```

## Subcommands

| Lệnh | Chức năng | Task |
|---|---|---|
| `products list\|get\|create\|update\|delete` | CRUD sản phẩm (service role). Delete cần gõ lại slug (confirm 2 bước) | P12T03 |
| `publish` | Build + `vercel --prod` — **CHỜ ANH DUYỆT trước khi chạy** | P12T03 |
| `links` | Crawl sitemap production → check link + ảnh hỏng | P12T04 |
| `i18n` | So sánh nội dung VI/EN trong DB | P12T04 |
| `seo` | Audit SEO per-page (title/desc/canonical/hreflang/OG/JSON-LD/alt) | P12T04 |
| `smoke` | Post-deploy: HTTP routes + NO_JS_ERRORS (CDP) + sitemap/robots | P12T05 |
| `ci` | Theo dõi GitHub Actions (`gh run list/view --log-failed`) | P12T05 |
| `rollback` | Dry-run kế hoạch rollback — thực thi chỉ khi anh duyệt | P12T05 |

## Guard

- **push / deploy / delete = chờ anh duyệt qua Telegram** (SOUL sangbot + OPERATIONS.md).
- Mọi write log vào `.tmp/ops.log` (gitignored).
- Secret (service role key) chỉ đọc từ `.env.local` — không in ra chat/log.

## Chi tiết

- Playbook đầy đủ: `.ai/OPERATIONS.md` (post-deploy checklist, phân loại lỗi, rollback 3 đường).

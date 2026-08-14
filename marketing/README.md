# Marketing Pipeline — SangDupont (Phase 11)

Một sản phẩm + ảnh → **8 đầu ra marketing (VI + EN)** tự động, giảm nhập nội dung lặp lại.

## Dùng qua sangbot (Telegram)

Anh nhắn sangbot: **"sinh marketing cho <slug>"** (vd `black-lacquer`) → sangbot chạy:

```bash
cd /home/pi5/projects/Sangwebsite
npm run marketing -- <slug>        # = npx tsx scripts/marketing/generate.ts <slug>
```

## 8 đầu ra (mỗi loại có VI + EN)

1. **Product listing** — draft cho `/admin/products`
2. **Bài website** — draft nội dung trang
3. **Facebook post**
4. **TikTok caption**
5. **Story/Reel ngắn**
6. **SEO metadata** — `seo-vi.json` / `seo-en.json` (title ≤70, desc ≤165) → dán vào admin/meta
7. **Alt text** — `alt.txt`, từng ảnh × 2 ngôn ngữ (AI vision xem ảnh thật)
8. **Bản tiếng Anh** — mọi đầu ra đã có EN riêng

## Output & review

- Draft lưu tại `marketing/drafts/<slug>/` (git-tracked):
  `listing-{vi,en}.md, web-{vi,en}.md, facebook-{vi,en}.md, tiktok-{vi,en}.md, story-{vi,en}.md, seo-{vi,en}.json, alt.txt`
- **Review trước khi publish**: `git diff marketing/drafts/` (hoặc xem từng file).
- Publish: dán nội dung vào `/admin` (hoặc sangbot cập nhật qua `sangops products update`).

## Guard (bắt buộc)

- AI **chỉ dùng dữ liệu thật** từ Supabase (tên, dòng, chất liệu, tình trạng, giá nếu có).
- Giá NULL → luôn "Liên hệ 0905 076 886" — **không bao giờ bịa số tiền/năm/claim**.
- AI **chỉ tạo draft** — human (anh) duyệt trước publish (D11 + D27).
- Chi phí model log tại `.tmp/marketing-log.md` (số calls × model).

## Kỹ thuật

- `scripts/marketing/load-product.ts` — loader (service role, `.env.local`).
- `scripts/marketing/templates.ts` — prompt templates 7 loại × 2 ngôn ngữ + guard.
- `scripts/marketing/generate.ts` — generator: text `deepseek-v4-flash` + vision `qwen3.7-plus` (opencode-go, Pi5). Key từ `~/.hermes/secrets/shared.env` (KHÔNG vào git).
- Model reasoning có thể tốn budget → generator tự retry với max_tokens 8000 nếu content rỗng.

# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14. **RELEASE A COMPLETE 2026-08-14 (Gate 10/10 PASS).**

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 6: SEO + GA4 + Performance — ✅ DONE 2026-08-14 (Lighthouse mobile 94 / desktop 100)
## Phase 7: Release A Gate + Deploy Vercel — ✅ DONE 2026-08-14 (Gate 10/10 + tag v1.0-release-a)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

### [#P7T06] Fix font tiếng Việt — load thật qua next/font/google (Playfair Display + Cormorant Garamond + Inter, subset vietnamese)

**Goal**: Sửa lỗi hiển thị font tiếng Việt vỡ (dấu tách rời/glyph thiếu — anh phát hiện 2026-08-14 trên production). CSS khai báo Playfair/Cormorant/Inter nhưng KHÔNG load → fallback hệ thống. Load qua `next/font/google` (tự host, subset latin+vietnamese, preload + font-display swap sẵn) — không tụt perf.

**Depends on**: `none` (fix post-Release A)
**Parallel-safe**: `no`

**Context hiện có**:
- `app/globals.css:13-15`: `--serif:'Playfair Display',...` / `--serif-2:'Cormorant Garamond',...` / `--sans:'Inter',...` — tên font nhưng không load → browser fallback Georgia/system → tiếng Việt vỡ
- `app/layout.tsx`: RootLayout không có font config; build PASS; Lighthouse hiện mobile 94/desktop 100

**Concrete changes** (Mika tự làm — cấu hình font tinh tế, runner dễ sai):
1. `app/layout.tsx`: import `{ Playfair_Display, Cormorant_Garamond, Inter }` từ `next/font/google`:
   - `const playfair = Playfair_Display({ subsets:["latin","vietnamese"], variable:"--font-serif", display:"swap" })`
   - `const cormorant = Cormorant_Garamond({ subsets:["latin","vietnamese"], variable:"--font-serif-2", weight:["400","500","600"], style:["normal","italic"], display:"swap" })`
   - `const inter = Inter({ subsets:["latin","vietnamese"], variable:"--font-sans", display:"swap" })`
   - RootLayout `<html className={\`${playfair.variable} ${cormorant.variable} ${inter.variable}\`} ...>` (giữ lang="vi" + metadata)
2. `app/globals.css`: 3 tokens → `--serif: var(--font-serif), 'Playfair Display', Georgia, serif;` / `--serif-2: var(--font-serif-2), 'Cormorant Garamond', Georgia, serif;` / `--sans: var(--font-sans), system-ui, sans-serif;`
3. Build + verify: HTML có preload font woff2 (self-host); Lighthouse lại ≥85/90
4. Browser CDP screenshot trang chủ → so ảnh text vàng serif ("DI SẢN / Của Lửa", "Sở hữu một phần lịch sử") — dấu tiếng Việt đúng

**Constraints**: 3 font Google miễn phí, hỗ trợ subset vietnamese đầy đủ (Playfair Display ✓ / Cormorant Garamond ✓ / Inter ✓); KHÔNG thêm @import/<link> Google Fonts (next/font tự host); KHÔNG đổi màu/weight/layout
**Definition of Done**: build PASS; preload woff2 trong HTML; Lighthouse ≥85/90; browser screenshot dấu tiếng Việt đúng (anh xác nhận); deploy production + commit

**Status**: `[x]` — verified 2026-08-14 (Mika): next/font/google self-host 3 font (subset vietnamese), browser CDP dấu tiếng Việt đúng + font premium; Lighthouse mobile 86/desktop 100 (tối ưu weight 600/400 italic/400-500, 17 files giảm từ 22); deploy production + anh xác nhận

## Phase 8: AI Concierge — Release B
_(chưa băm task — gated: chờ sử dụng thật; hướng: Edge Function proxy + Hermes sangbot đã chạy)_

## Phase 9: Full AI — nội bộ + Vision + Research
_(chưa băm task — gated: chờ ROI Release B)_

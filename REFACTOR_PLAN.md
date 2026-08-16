# REFACTOR_PLAN — SangDupont (bước PHÂN TÍCH, chưa sửa code)

> Ngày: 2026-08-16 · Branch: `refactor/zcode` · Người viết: ZCode (phân tích tĩnh + đọc HTML build thật trong `.vercel/output/static/`).
> **Chưa sửa bất kỳ file code nào.** Mọi phát hiện đều kèm `file:dòng` đã đối chiếu trực tiếp.

---

## 1. Tóm tắt hiện trạng

**Kiến trúc**: Next.js 16.3.1 `output: "export"` (static, prebuilt deploy Vercel) + React 19.2.8 + Supabase (Postgres + Storage + 3 Edge Functions) + Telegram notify. Trang public **hoàn toàn tĩnh, 0 query DB lúc runtime** (catalog chỉ query lúc build) — rất hợp free tier. Admin là client-side app dùng RLS Supabase.

**Quy mô**: ~50 file nguồn — 8 file app routes (home vi/en, product `[slug]`, 3 trang admin, robots, sitemap), 16 components, 4 file lib, 12 script ops/marketing, 3 edge functions (Deno), 7 migration SQL (216 dòng).

**Dependencies (rất gọn — tốt)**: runtime chỉ 4 package (`next`, `react`, `react-dom`, `@supabase/supabase-js`). Dev: typescript 5, eslint 9 (flat config, tắt đúng rule `no-img-element` cho static export), tsx.

**Bundle (đo từ `.vercel/output/static/`)**: CSS 22KB, JS chunks tổng ~992KB (2 chunk framework ~232KB + ~224KB — bình thường cho Next 16 + React 19), ảnh `public/assets/img` 1.4MB (mỗi ảnh 34–190KB — chuẩn), **video `hero-veo.mp4` 2.6MB** (nặng nhất site).

**Điểm mạnh cần giữ**: deps tối giản; RLS chặt (leads/ai_chat_logs không public đọc; write chỉ `is_admin()`); edge function có CORS origin trắng, rate limit, cost cap, kill switch (ai-chat); `renderTextWithLinks` không dùng `dangerouslySetInnerHTML`; robots chặn `/admin`; secrets chỉ nằm trong Supabase env (không lộ trong code client — anon key là public theo thiết kế).

---

## 2. Lỗi / nguy cơ phát hiện

Mức độ: **CAO** = bug khách thấy được / mất tiền / SEO nặng · **VỪA** = rủi ro rõ nhưng ảnh hưởng giới hạn · **THẤP** = smell/cosmetic. Nhãn tự tin theo RULE 9.

### CAO

| # | file:dòng | Vấn đề | Đề xuất |
|---|---|---|---|
| C1 | `components/Collection.tsx:35,57` | Card gallery **luôn dùng `name_vi`** (tên + alt) bất kể lang — khách /en thấy tên tiếng Việt **vĩnh viễn** (đã verify `en.html`: "L2 Diamond Thập niên 80" ×3, "Sơn mài đen huyền" ×4). Prop `lang` đã có sẵn nhưng không dùng cho tên. | Dùng `lang === "en" ? p.name_en : p.name_vi` cho cả `<b>` và `alt`. |
| C2 | `app/[lang]/products/[slug]/page.tsx:61-70` + `components/Contact.tsx:10-24` | Trang product **không bọc `I18nProvider`** → cơ chế `data-i18n` không chạy → heading/note mục Liên hệ **giữ tiếng Việt mãi mãi** trên `/en/products/*` (đã verify `en/products/ignition-mechanism.html`: "Sở hữu một phần lịch sử", "Inbox hoặc gọi trực tiếp" đều VI, trong khi LeadForm ngay dưới lại EN — trang hai ngôn ngữ trộn). | Bọc provider, hoặc tốt hơn: chuyển Contact sang `usePathname()` như LeadForm/Services (xem R1). |
| C3 | `app/layout.tsx:33-47,56` | `<html lang="vi">` **hardcoded** cho mọi trang + metadata gốc (title/description/OG) **chỉ tiếng Việt** → `/en` có `lang="vi"` sai, title VI (verify `en.html`). SEO + accessibility + crawler đều sai. | Tạo `app/[lang]/layout.tsx` set `lang` + metadata theo segment; root layout giữ metadata trung tính. |
| C4 | `components/Hero.tsx:12-21` + `public/assets/video/hero-veo.mp4` | Video 2.6MB `autoPlay` **mọi visitor kể cả mobile** (mobile còn tải thêm `hero-mobile.jpg` 117KB + preload `hero.jpg` 167KB). Comment trong code nói "thử nghiệm local — không git/deploy" nhưng file **đang được track trong git và có trong HTML deploy** (verify `en.html` ref `hero-veo.mp4`). Đánh LCP nặng nhất site. | Q1 cho anh Sinh: nén <1MB + chỉ phát trên desktop + `preload="none"`, hoặc bỏ hẳn. |
| C5 | `lib/catalog.ts:29-59` | Khi Supabase lỗi/thiếu env lúc build → `getAllProducts()` **trả `[]` âm thầm** (chỉ `console.warn`) → build PASS, deploy site **mất toàn bộ sản phẩm** không ai biết. Rủi ro vận hành thật (DB pause, rate limit, sai env). | Fail-hard khi build: throw nếu env thiếu hoặc query lỗi (chỉ trong context build, giữ fallback [] cho dev). |
| C6 | `supabase/functions/vision-intake/index.ts:84-99` | Mode `draft`/`translate` là **tính năng admin** nhưng gọi được bằng anon key công khai: không phân quyền, **không cost cap ngày** (khác ai-chat có 100/ngày), **không kill switch `AI_ENABLED`**. Chỉ chắn 30 req/h/IP — xoay IP là đốt token AI tự do. Tự tin: CAO. | Thêm kill switch + xác minh JWT admin cho 2 mode này (xem R11). |

### VỪA

| # | file:dòng | Vấn đề | Đề xuất |
|---|---|---|---|
| V1 | `app/[lang]/products/[slug]/page.tsx:37` | `canonical` **luôn trỏ `/vi/products/...`** kể cả trang EN → Google có thể bỏ index bản EN (hreflang có nhưng canonical mâu thuẫn). | Canonical theo lang của trang. |
| V2 | `components/AiChat.tsx:315` | Zalo handoff `https://zalo.me/0905076886` — **sai định dạng** (thiếu mã quốc gia). Mọi chỗ khác dùng `84905076886` (`Contact.tsx:31`, `About.tsx:56`, `ProductDetail.tsx:366`). Zalo cần số 84… → link có thể không mở được chat. Tự tin: TRUNG BÌNH (cần bấm thử thật). | Đổi thành `84905076886`. |
| V3 | `lib/supabase.ts:3-11` + `lib/catalog.ts:27-74` | `getSupabaseClient()` tạo client **mới mỗi lần gọi**; `getAllProducts()` bị gọi N lần mỗi build (generateStaticParams + metadata + page + getProductBySlug + getSimilarProducts cho **mỗi trang product × 2 ngôn ngữ**) — mỗi lần 2 query → build chậm, dễ đụng rate limit free tier khi catalog lớn. | Bọc `React.cache()` + singleton client (R7). |
| V4 | `lib/supabase.ts` vs `lib/supabase-client.ts` | 2 module client song song (một lazy factory cho catalog, một eager singleton cho admin) — trùng lặp, dễ nhầm khi import (bản thân tôi cũng nhầm khi đọc). | Gộp 1 module (R16). |
| V5 | `supabase/functions/ai-chat/index.ts:150-244` | 2 action `lead_summary` + `chat_photo` **return trước đoạn rate limit** (dòng 273) → không giới hạn: ai biết `request_code` (8 ký tự, chính khách thấy) có thể spam Telegram chủ shop vô hạn. | Áp rate limit chung trước khi xử lý action (R12). |
| V6 | `supabase/functions/ai-chat/index.ts:173-181,459` | Telegram `parse_mode:"HTML"` nhưng **không `escapeHtml`** ở nhánh `lead_summary` và tool `create_lead` (create-lead function thì có escape ở `:206-208`) → tên khách chứa `<` `&` → Telegram trả 400 → **mất thông báo lead**. | Thêm escape như create-lead. |
| V7 | `components/LeadForm.tsx:195,277-308` vs `supabase/functions/create-lead/index.ts:109-111` | Client cho **1.5MB/ảnh × 3** nhưng server chỉ nhận **tổng 3MB raw** → khách chọn 3 ảnh ~1.4MB: chờ upload xong mới bị 400 "Tổng ảnh tối đa 3MB". UX tệ, mất lead. Ngoài ra 3 ảnh 1.5MB → JSON base64 ~6MB có thể vướng giới hạn body edge function. Tự tin: TRUNG BÌNH (giới hạn body chính xác cần đo). | Client check tổng ≤3MB trước submit (R6). |
| V8 | `supabase/functions/ai-chat/index.ts:377,411` | Từ khóa chèn thẳng vào filter `.or(\`name_vi.ilike.%${kw}%...\`)` — PostgREST parse an toàn, không thành SQL tùy ý, nhưng kí tự `,` `.` có thể **đổi logic filter**. Data là catalog public nên rủi ro thấp. Tự tin: CAO về bản chất, THẤP về tác động. | Strip `,().%` khỏi kw trước khi ghép. |
| V9 | `components/AdminGuard.tsx:7` + `app/admin/page.tsx:8` + `supabase/migrations/20260814160000_admin_allowlist_email.sql` | Allowlist admin giữ ở **3 nơi** (2 file TS + SQL) — thêm admin phải sửa 3 chỗ, lệch 1 chỗ là lệch guard/RLS. | Gom về 1 hằng số dùng chung + ghi chú SQL (R17). |
| V10 | `supabase/functions/ai-chat/index.ts:512-525` | `history` từ client đẩy thẳng làm message `assistant` — **prompt injection** (giả lời bot "đã hứa giá X"). Với sales-bot rủi ro thấp nhưng nên biết. Tự tin: CAO về khả năng, THẤP về hại. | Ghi nhận; có thể prefix mỗi lượt history "do người dùng cung cấp". |
| V11 | `components/Nav.tsx:59,67` + `next.config.ts:7` | Đổi ngôn ngữ dùng `window.location.href = "/vi/"` → full page reload + rơi vào rule 308 trailing-slash của Vercel (`/vi/` → `/vi`) → **2 hop** mỗi lần switch. Redirect gốc `/` → `/vi/` → `/vi` cũng 2 hop. | Dùng `next/link` tới `/vi` (không slash) — R9. |
| V12 | `components/Lightbox.tsx:15-29` + `components/Collection.tsx:34` | Listener click toàn document bắt `.card` để mở lightbox, nhưng card giờ là `<Link>` → click card **vừa navigate vừa mở lightbox** (set `body overflow hidden` rồi unmount). Lightbox trên home thực chất là hành vi thừa/glitch. | Bỏ listener trên card hoặc xóa Lightbox khỏi home (R10). |
| V13 | `components/Marquee.tsx:8-11` | Chuỗi marquee **hardcoded VI, không có data-i18n** → /en thấy tiếng Việt vĩnh viễn (verify `en.html` "Bảo dưỡng chuyên sâu"). | Thêm key i18n hoặc render theo lang (R1). |
| V14 | `components/AiChat.tsx:195,199,203,210,233,236,418,434` | Phản hồi widget khi xử lý ảnh + "Đang phản hồi..." + title nút 📎 đều **VI cứng** trên trang EN; `sendMessage("em đã gửi ảnh: ...")` (:234) gửi message VI cho model kể cả khi lang=en. | Đưa vào dict T có sẵn của AiChat. |
| V15 | `supabase/functions/ai-chat/index.ts:584-617` | Fallback deterministic khi model trả rỗng **chỉ tiếng Việt** — user EN gặp fallback (đã xảy ra theo pitfall trong comment) sẽ nhận câu VI. | Thêm bản EN theo `uiLang`. |
| V16 | `app/[lang]/page.tsx:46` | `preload hero.jpg` trong khi video (z-index cao hơn) phủ ảnh → desktop tải cả jpg 167KB + video 2.6MB. | Gắn với quyết định video (C4/R5). |
| V17 | `app/sitemap.ts:12-15,20,30` | Sitemap **thiếu URL home `/vi`, `/en`** (chỉ có `/` redirect + products); `lastModified` luôn `new Date()` → mọi build đánh dấu mọi URL là mới. | Thêm 2 entry home; lastModified từ `created_at` sản phẩm. |
| V18 | `supabase/migrations/20260814160000_admin_allowlist_email.sql` | `is_admin()` so **email claim trong JWT**. Nếu "Allow new users to sign up" chưa tắt ở dashboard (migration chỉ ghi chú UI, không kiểm chứng được từ code) thì ai đó đăng ký email trùng allowlist (nếu qua verify email) sẽ có JWT admin. Tự tin: KHÔNG BIẾT trạng thái dashboard — cần anh Sinh xác nhận. | Xác nhận signup đang tắt;中期 chuyển sang `auth.uid()` allowlist (R15). |
| V19 | `components/ProductDetail.tsx:426,262` | "Gallery" và "No image available" **EN cứng trên trang VI** (đổi chiều với các lỗi trên). | Thêm vào dict `t` có sẵn của component. |

### THẤP

| # | file:dòng | Vấn đề | Đề xuất |
|---|---|---|---|
| T1 | `components/ProductDetail.tsx:152-193` | Hover breadcrumb dùng `onMouseEnter/Leave + setState` → re-render cả component 585 dòng mỗi lần hover; ~40 style object literal dựng lại mỗi render. | Hover chuyển CSS (`:hover` class); style object ra hằng số module. |
| T2 | `supabase/functions/vision-intake/index.ts:2,97-99` | Doc drift: comment nói `qwen3.8-max`, code default `qwen3.7-plus`. | Đồng bộ comment. |
| T3 | `supabase/functions/create-lead/index.ts:122` | `contentType: "image/jpeg"` cứng cho mọi ảnh (png lưu sai mime). | Truyền mime thật (client đã gửi `file.type` cho chat_photo — làm tương tự). |
| T4 | `supabase/functions/create-lead/index.ts:104-117` | `b64ToBytes` chạy 2 lần mỗi ảnh (lần đếm tổng + lần upload). | Tính 1 lần, reuse. |
| T5 | `app/admin/products/page.tsx:1362-1363` | `cursor: drafting \|\| !editing ? "not-allowed"` lệch với điều kiện `disabled` (dòng 1354) → tạo mới đã có ảnh vẫn hiện con chuột cấm dù bấm được. | Đồng nhất biểu thức. |
| T6 | `app/admin/products/page.tsx:446` | Ảnh upload khi **tạo mới** luôn `kind: "cover"` cho mọi ảnh (admin chỉ mong đầu tiên là cover) → data nhiều cover. | kind = `i === 0 ? "cover" : "gallery"`. |
| T7 | `components/Hero.tsx:12-21` | Video không tôn trọng `prefers-reduced-motion` (CSS có ở `globals.css:276-279` nhưng video là media). | Gộp vào C4. |
| T8 | `supabase/functions/ai-chat/index.ts:563` | `if (!choice) return 502` **không ghi `ai_chat_logs`** (các nhánh lỗi khác đều ghi). | Thêm insert log cho đồng bộ báo cáo. |
| T9 | `app/` (không có `not-found.tsx`) | 404 dùng trang default của Next (trắng, không brand). | Thêm 1 file `not-found.tsx` tĩnh. |
| T10 | `components/ProductDetail.tsx:562-580` | JSON-LD không escape `<` trong `JSON.stringify` — data do admin nhập nên rủi ro thấp, nhưng `</script>` trong desc sẽ vỡ. | `.replace(/</g, "\\u003c")`. |
| T11 | `app/admin/products/page.tsx:97-99`, `app/admin/leads/page.tsx:68-70` | `setTimeout` ẩn toast không clear khi unmount. | Lưu id + clear trong cleanup. |
| T12 | Kiến trúc slug | Đổi slug sản phẩm → URL cũ 401/404 (không có redirect history) — chấp nhận được ở quy mô này, ghi nhận. | — |

---

## 3. Đề xuất refactor theo ưu tiên

Nguyên tắc: **an toàn/dúng > gọn nhẹ > mượt**. Mỗi mục độc lập, tách task nhỏ được. Cột cuối: có chạm auth/DB/security không (điều kiện Reviewer theo AGENTS.md).

### P1 — Sửa bug thật, không chạm auth/DB

**R1. i18n render đúng ngôn ngữ lúc build (gỡ cơ chế DOM swap)** — *đề xuất lớn nhất, tự tin CAO*
- Thay đổi: mọi component dùng `lang` ngay lúc render (qua `useI18n().lang` tại thân render — `initialLang` đã có trong provider — thay vì `useEffect` quét `[data-i18n]` sửa `textContent`). Component cụ thể: `Hero.tsx`, `About.tsx`, `Services.tsx`, `Contact.tsx`, `Footer.tsx`, `Nav.tsx`, `Marquee.tsx`, `Collection.tsx` (+name_en theo C1), bọc provider cho trang product (C2), sửa V14/V19.
- Lợi ích: HTML tĩnh /en chứa tiếng Anh đúng (SEO + không flash VI→EN + đúng `data-i18n` xung đột React); 1 cơ chế i18n thay vì 4.
- Rủi ro: regress text UI — cần browser-verify cả /vi lẫn /en + trang product; giữ key `data-i18n` tạm thời cho an toàn.
- Chạm auth/DB/security: **Không**.

**R2. `<html lang>` + metadata theo ngôn ngữ** — tạo `app/[lang]/layout.tsx` (set `lang` attr, title/description VI/EN), root layout bỏ metadata VI cứng (C3). Không chạm auth/DB. Rủi ro thấp.

**R3. Fix link Zalo** — 1 dòng `AiChat.tsx:315` (V2). Không rủi ro.

**R4. Build guard chống site rỗng** — `lib/catalog.ts` throw khi build (C5). Chạm: không (chỉ hành vi build).

**R5. Hero video + preload** — phụ thuộc Q1 (bỏ / nén / tắt mobile). Ước tính tiết kiệm 1.5–2.6MB/lượt visit mobile. Không chạm auth/DB.

**R6. LeadForm nhất quán giới hạn ảnh** — client check tổng ≤3MB trước submit + thông báo sớm (V7). Không chạm backend.

### P2 — Perf/SEO (vẫn không chạm auth/DB)

**R7. Dedupe query build + singleton client** — `React.cache(getAllProducts)` + client Supabase module-level (V3, V4). Lợi ích: build nhanh hơn nhiều lần, giảm nguy cơ rate limit; không đổi output. Rủi ro: gần 0.

**R8. SEO bộ ba** — canonical per-lang (V1), sitemap có home + lastModified thật (V17). Không rủi ro chức năng.

**R9. Nav dùng `<Link>` + URL không trailing slash** (V11) — mượt khi đổi ngôn ngữ. Rủi ro thấp.

**R10. Lightbox** — bỏ listener card toàn cục (vì card đã là Link) hoặc xóa component khỏi home (V12). Rủi ro thấp.

### P3 — Security/cost (CHẠM edge functions — cần anh Sinh duyệt deploy)

**R11. vision-intake hardening** (C6): thêm kill switch `AI_ENABLED` + yêu cầu JWT admin cho mode `draft`/`translate` (edge đọc `Authorization`, verify qua `supabase.auth.getUser(header)` — không cần migration). Lợi ích: chặn đốt token AI. Rủi ro: phải deploy edge function; mode admin trong trang admin cần gửi kèm token (client supabase đã có session — lấy `getSession().access_token`).
Chạm security: **Có** (Reviewer gate).

**R12. Rate limit cho `lead_summary`/`chat_photo`** (V5) — đưa 2 action vào sau kiểm tra count IP như chat thường. Chạm security: có (deploy edge).

**R13. Escape HTML Telegram** (V6) + **R14. sanitize kw .or()** (V8) + T8 — sửa nhỏ trong ai-chat/create-lead. Chạm security: có (deploy edge). **Lưu ý: các sửa trong `ai-chat/index.ts` (R13/R14/V15/T8) phải hạn chế tối thiểu — KHÔNG đụng SYSTEM_PROMPT theo ZCODE_GUIDE.**

**R15. (tùy chọn, chạm DB) is_admin theo `auth.uid()`** (V18) — migration mới + sửa hàm SQL. Chỉ làm sau khi xác nhận tình trạng signup. Chạm auth/DB: **Có** — bắt buộc Reviewer.

### P4 — Dọn code (khẩn cấp thấp)

- **R16** gộp `lib/supabase.ts` + `lib/supabase-client.ts` (V4).
- **R17** `ADMIN_EMAILS` về 1 hằng số import chung (V9).
- **R18** ProductDetail: style ra hằng số + hover bằng CSS (T1) — chỉ làm khi rảnh, diff lớn dễ conflict.
- **R19** các chuỗi i18n lẻ (V13 Marquee, V14 AiChat, V19) — gộp vào R1.

---

## 4. Khuyến nghị KHÔNG đụng

1. **`SYSTEM_PROMPT` và hành vi chat trong `ai-chat/index.ts:12-78`** — ZCODE_GUIDE cấm rõ ràng trừ khi có plan duyệt riêng; prompt đã tinh chỉnh nhiều vòng (có pitfall ghi chú).
2. **RLS/migrations hiện tại** — thiết kế đúng (public read có điều kiện, write qua `is_admin()`, `ai_chat_logs` không policy). Không thêm/bỏ policy trong đợt này.
3. **Auth flow admin (GitHub OAuth + email/password)** — đang hoạt động; hardening là P3 tùy chọn, không phải lỗi.
4. **Kiến trúc static export + Vercel prebuilt + không dùng `next/image`** — đúng cho free tier (không tốn image optimizer, catalog không query runtime). Đừng "nâng cấp" sang ISR/SSR.
5. **`scripts/ops/*`, `scripts/marketing/*`** — công cụ vận hành nội bộ, ngoài phạm vi.
6. **Font setup `app/layout.tsx:11-31`** — đã subset + giới hạn weight chuẩn.
7. **Bảng `services/testimonials/case_studies/faq`** chưa dùng nhưng giữ nguyên — schema ổn, xóa là migration vô ích.

---

## 5. Câu hỏi cần anh Sinh quyết định

1. **Video hero 2.6MB (C4)**: giữ nguyên / nén + chỉ phát desktop / bỏ hẳn và dùng ảnh hero? — ảnh hưởng LCP lớn nhất site. (Đề xuất: nén <1MB + bỏ mobile.)
2. **/en là market thật không?** Nếu có → R1+R2+R8 đáng đầu tư sớm (SEO EN đang bị index nội dung VI). Nếu chỉ trang danh dự → chỉ sửa C1/C2 (bug thấy được) và hạ ưu tiên SEO EN.
3. **Cho phép refactor i18n kiểu R1** (bỏ cơ chế `data-i18n` DOM swap, render đúng ngôn ngữ từ đầu)? Đây là thay đổi cơ chế — đúng hướng nhưng diff chạm ~10 component. (Khuyến nghị: có.)
4. **P3 có làm ngay không** — sửa edge functions (R11–R14) cần deploy Supabase; ZCODE_GUIDE cấm deploy trong đợt refactor này → xác nhận để lên đợt riêng có anh duyệt từng bước.
5. **Xác nhận trạng thái Supabase Dashboard**: "Allow new users to sign up" đã tắt chưa (V18)? Nếu chưa tắt → đề nghị tắt ngay (thao tác UI, không phải code).
6. **Quy trình rebuild hiện tại**: site tĩnh chỉ cập nhật sản phẩm khi build + deploy lại — quy trình hiện tại (thủ công qua `scripts/ops/publish.ts`?) đã đủ chưa, hay cần CI tự build định kỳ? (Chỉ ghi nhận để планиров, không đề xuất thêm hệ thống.)

---

# QUYẾT ĐỊNH ĐÃ DUYỆT (16-08, anh Sinh chốt theo khuyến nghị Mika + agy Opus 4.6)

| Q | Quyết định | Hệ quả |
|---|---|---|
| Q1 | **GIỮ video hero** (không bỏ, không nén) | R5 thu gọn: chỉ bỏ `<link preload hero.jpg>` (V16) + tôn trọng `prefers-reduced-motion` (T7) + sửa comment sai "không git/deploy"; KHÔNG đụng autoplay/media |
| Q2 | **/en LÀ market thật** — đầu tư SEO EN đầy đủ | R1 + R2 + R8 làm đầy đủ (không hạ ưu tiên) |
| Q3 | **Làm refactor i18n R1** (bỏ DOM swap, render theo lang) | R1 chạm ~10 component; bắt buộc browser-verify /vi + /en + trang product |
| Q4 | **P3 (R11-R14) làm ngay SAU đợt 1** — cần deploy edge function, anh duyệt từng bước | Đợt 1 không chạm supabase/functions; đợt 2 riêng |
| Q5 | **Signup KHÔNG phải rủi ro** — verified DECISIONS_LOG L1 (14-08): `disable_signup=false` chủ đích (GitHub OAuth cần tạo user) + `external_email_enabled=false` (không đăng ký email) + RLS `is_admin()` chặn write mọi user khác | V18 hạ mức; R15 (auth.uid allowlist) tùy chọn, để đợt sau |
| Q6 | Rebuild thủ công đủ — không thêm CI | Chỉ ghi nhận |

**LƯU Ý R2 (agy review bổ sung)**: Next 16 KHÔNG cho nested layout render `<html>` → R2 tách 2 phần: (a) **R2a** `app/[lang]/layout.tsx` chỉ export `generateMetadata` (title/description/OG theo lang — hoạt động, merge với root) + sửa home /en metadata (hiện chỉ set alternates); (b) **R2b** `<html lang>` chuẩn SEO cần route group `(site)/(admin)` — **để đợt sau** (hreflang đã có, impact SEO thấp).

**THỨ TỰ THỰC HIỆN (đã duyệt)**:
1. **Đợt 1** (không chạm deploy/DB/edge): R1 i18n (gồm C1/C2/V13/V14/V19) → R2a metadata → R3 Zalo → R4 build guard → R5 video nhẹ → R6 LeadForm 3MB → R7 dedupe query → R8 SEO → R9 nav Link → R10 Lightbox → T9 not-found
2. **Đợt 2** (chạm edge — anh duyệt deploy từng bước): R11 vision-intake kill switch + JWT admin → R12 rate limit lead_summary/chat_photo → R13 escape Telegram → R14 sanitize kw + T2/T8
3. **Đợt sau** (tùy chọn): R2b html lang route group, R15 is_admin uid, R16/R17 gộp module, R18 style/hover

---

*Hết plan — chưa thay đổi dòng code nào. Sẵn sàng băm thành WBS tasks khi anh duyệt.*

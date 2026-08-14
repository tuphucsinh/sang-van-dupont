/**
 * P11T02 — Prompt templates cho AI Marketing Pipeline.
 * Mỗi template nhận MarketingProduct (data THẬT từ Supabase) → trả prompt cho LLM.
 * Guard: KHÔNG bịa giá/tồn kho/tình trạng; price null → hướng dẫn "Liên hệ"; không thêm năm/thông số ngoài data.
 */
import type { MarketingProduct } from "./load-product";

export type TemplateKind = "listing" | "web" | "facebook" | "tiktok" | "story" | "seo" | "alt";

export const TEMPLATE_KINDS: { id: TemplateKind; labelVi: string; labelEn: string }[] = [
  { id: "listing", labelVi: "Product listing", labelEn: "Product listing" },
  { id: "web", labelVi: "Bài website", labelEn: "Website article" },
  { id: "facebook", labelVi: "Facebook post", labelEn: "Facebook post" },
  { id: "tiktok", labelVi: "TikTok caption", labelEn: "TikTok caption" },
  { id: "story", labelVi: "Story/Reel ngắn", labelEn: "Story/Reel short" },
  { id: "seo", labelVi: "SEO metadata", labelEn: "SEO metadata" },
  { id: "alt", labelVi: "Alt text", labelEn: "Alt text" },
];

const SHOP = {
  vi: {
    brand: "SangDupont (Sang Van) — cửa hàng bật lửa S.T. Dupont vintage chính hãng",
    phone: "0905 076 886",
    zalo: "https://zalo.me/84905076886",
    telegram: "t.me/sangdupontbot",
    priceNull: "Giá: đang cập nhật — hướng dẫn khách liên hệ 0905 076 886 / Zalo để được báo giá (KHÔNG tự nêu con số)",
    tone:
      "Giọng sang trọng, tinh tế, đúng phong cách luxury đen-vàng: ngắn gọn, có hồn, không phô trương, không sáo rỗng. Khách mua bật lửa sưu tầm → nhấn giá trị thủ công, lịch sử, cảm xúc.",
    cta: "Kêu gọi hành động: nhắn Zalo 0905 076 886 hoặc chat trên website để xem ảnh chi tiết và được tư vấn.",
    disclaimer: "KHÔNG khẳng định thật/giả, KHÔNG tự định giá, KHÔNG cam kết bảo hành/thời gian sửa.",
  },
  en: {
    brand: "SangDupont (Sang Van) — vintage S.T. Dupont lighter store",
    phone: "+84 905 076 886",
    zalo: "https://zalo.me/84905076886",
    telegram: "t.me/sangdupontbot",
    priceNull: "Price: updating — tell customers to contact +84 905 076 886 / Zalo for a quote (NEVER invent a number)",
    tone:
      "Elegant, refined, luxury black-and-gold tone: concise, soulful, not flashy, no empty clichés. Collectors of fine lighters → emphasize craftsmanship, heritage, emotion.",
    cta: "Call to action: message on Zalo +84 905 076 886 or chat on the website for detailed photos and advice.",
    disclaimer: "Do NOT claim authentic/fake, do NOT set prices, do NOT promise warranty or repair time.",
  },
};

function productFacts(p: MarketingProduct, lang: "vi" | "en"): string {
  const s = SHOP[lang];
  const lines = [
    `- Tên: ${lang === "vi" ? p.nameVi : p.nameEn}`,
    p.line ? `- Dòng: ${p.line}` : null,
    p.material ? `- Chất liệu: ${p.material}` : null,
    p.year ? `- Năm/Thời kỳ: ${p.year}` : null,
    p.condition ? `- Tình trạng: ${p.condition}` : null,
    p.price !== null ? `- Giá: ${p.price} (chỉ dùng đúng con số này)` : `- ${s.priceNull}`,
  ].filter(Boolean);
  const desc = lang === "vi" ? p.descVi : p.descEn;
  if (desc) lines.push(`- Mô tả hiện có: ${desc}`);
  lines.push(`- Ảnh: ${p.media.map((m) => m.url).join(", ")}`);
  return lines.join("\n");
}

function guardBlock(lang: "vi" | "en"): string {
  const s = SHOP[lang];
  return [
    "LUẬT BẮT BUỘC:",
    `1. Chỉ dùng thông tin từ dữ liệu sản phẩm bên dưới. KHÔNG bịa giá, năm, thông số, tình trạng, nguồn gốc.`,
    `2. ${s.priceNull}`,
    `3. ${s.disclaimer}`,
    `4. Không thêm lời hứa bảo hành, ưu đãi giảm giá, hay claim chưa có trong dữ liệu.`,
  ].join("\n");
}

export function buildPrompt(kind: TemplateKind, lang: "vi" | "en", p: MarketingProduct): string {
  const s = SHOP[lang];
  const facts = productFacts(p, lang);
  const guard = guardBlock(lang);
  const brand = `${s.brand}. ${s.tone}`;

  const common = `DỮ LIỆU SẢN PHẨM (duy nhất được phép dùng):\n${facts}\n\n${guard}\n\n`;

  switch (kind) {
    case "listing":
      return `${common}Viết PRODUCT LISTING (${lang === "vi" ? "tiếng Việt" : "English"}) dùng cho trang sản phẩm: tên + mô tả 2-4 câu ${brand} ${s.cta} Giới hạn ~120 từ (${lang === "vi" ? "tiếng Việt" : "English"}).`;
    case "web":
      return `${common}Viết BÀI WEBSITE (${lang === "vi" ? "tiếng Việt" : "English"}) giới thiệu sản phẩm này: mở bài cuốn hút, thân bài nêu chất liệu/dòng/tình trạng từ dữ liệu (KHÔNG thêm), kết bài CTA. Dài ~150-200 từ. ${brand}`;
    case "facebook":
      return `${common}Viết FACEBOOK POST (${lang === "vi" ? "tiếng Việt" : "English"}): hook 1 câu, nội dung 3-5 câu, CTA, hashtag phù hợp (vd #STDupont #bậtLửaSưuTầm #SangDupont — ${lang === "vi" ? "tiếng Việt" : "English"} hashtags). Không emoji quá nhiều. ${brand}`;
    case "tiktok":
      return `${common}Viết TIKTOK CAPTION (${lang === "vi" ? "tiếng Việt" : "English"}): câu hook ngắn hấp dẫn + 2-3 dòng + 3-5 hashtag. Ngắn gọn, đúng trend nhưng sang trọng. ${brand}`;
    case "story":
      return `${common}Viết NỘI DUNG STORY/REEL NGẮN (${lang === "vi" ? "tiếng Việt" : "English"}): 1-2 câu tối đa (≤60 ký tự ý chính) kèm gợi ý caption 1 dòng cho story. ${brand}`;
    case "seo":
      return `${common}Viết SEO METADATA (${lang === "vi" ? "tiếng Việt" : "English"}). Trả về ĐÚNG định dạng JSON:
{"title": "...", "description": "..."}
Yêu cầu: title ≤ 60 ký tự, description ≤ 155 ký tự, chứa tên sản phẩm + từ khóa (S.T. Dupont vintage, ${lang === "vi" ? "bật lửa sưu tầm" : "collector lighter"}), KHÔNG thêm claim ngoài dữ liệu.`;
    case "alt":
      return `${common}Viết ALT TEXT (${lang === "vi" ? "tiếng Việt" : "English"}) cho ẢNH 1 của sản phẩm (mô tả hình ảnh ngắn gọn 10-15 từ, nhắc ${lang === "vi" ? "tên sản phẩm" : "product name"}, phù hợp SEO, không bịa chi tiết không thấy trong ảnh).`;
    default:
      return common;
  }
}

/** Prompt riêng cho alt text của TỪNG ảnh (vision thấy ảnh). */
export function buildAltPrompt(p: MarketingProduct, lang: "vi" | "en", imageUrl: string): string {
  const s = SHOP[lang];
  return [
    `Bạn là trợ lý nội dung của ${s.brand}.`,
    `Viết ALT TEXT (${lang === "vi" ? "tiếng Việt" : "English"}, 10-15 từ) cho ảnh này của sản phẩm "${lang === "vi" ? p.nameVi : p.nameEn}".`,
    `Mô tả ĐÚNG những gì thấy trong ảnh (chất liệu, màu, chi tiết) — KHÔNG bịa: không nêu giá, năm, thật/giả.`,
    `Chỉ trả về alt text, không giải thích.`,
  ].join("\n");
}

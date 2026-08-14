/**
 * P11T03 — Marketing generator: 1 sản phẩm → 8 đầu ra VI/EN (draft) + log chi phí.
 * CLI: npx tsx scripts/marketing/generate.ts <slug>
 * Output: marketing/drafts/<slug>/{listing,web,facebook,tiktok,story}-{vi,en}.md + seo.json + alt.txt
 * Model: deepseek-v4-flash (text) · qwen3.7-plus (vision) — opencode-go, chạy Pi5.
 */
import fs from "node:fs";
import path from "node:path";
import { loadProduct, type MarketingProduct, marketingEnv } from "./load-product";
import { buildPrompt, buildAltPrompt } from "./templates";

const BASE_URL = "https://opencode.ai/zen/go/v1";
const TEXT_MODEL = "deepseek-v4-flash";
const VISION_MODEL = "qwen3.7-plus";
const SHARED_ENV = "/home/pi5/.hermes/secrets/shared.env";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const DRAFTS_DIR = path.resolve(process.cwd(), "marketing/drafts");
const LOG_FILE = path.resolve(process.cwd(), ".tmp/marketing-log.md");

function loadSharedEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  if (fs.existsSync(SHARED_ENV)) {
    for (const line of fs.readFileSync(SHARED_ENV, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !m[1].startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

let callCount = 0;
const costLog: string[] = [];

async function callModel(model: string, prompt: string, imageB64?: string): Promise<string> {
  const shared = loadSharedEnv();
  const apiKey = process.env.OPENCODE_GO_API_KEY || shared.OPENCODE_GO_API_KEY || "";
  if (!apiKey) throw new Error("Thiếu OPENCODE_GO_API_KEY (shared.env)");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120_000);
  let res: Response;
  // Text-only: content = string (đúng pattern ai-chat); có ảnh: content = array (pattern vision-intake)
  const userContent: unknown = imageB64
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageB64}` } },
      ]
    : prompt;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: userContent }], max_tokens: 4000 }),
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Error(`Call ${model} fail: ${(e as Error).message}`);
  } finally {
    clearTimeout(timer);
  }
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Call ${model} HTTP ${res.status}: ${JSON.stringify(d).slice(0, 200)}`);
  const content2 = d?.choices?.[0]?.message?.content;
  if (typeof content2 !== "string" || !content2.trim()) {
    // deepseek-v4-flash là model reasoning: nếu reasoning ngốn hết budget → content rỗng; retry 1 lần (có timeout + check HTTP — Reviewer góp ý 3)
    const retryCtrl = new AbortController();
    const retryTimer = setTimeout(() => retryCtrl.abort(), 120_000);
    let retryRes: Response;
    try {
      retryRes = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: "user", content: userContent }], max_tokens: 8000 }),
        signal: retryCtrl.signal,
      });
    } finally {
      clearTimeout(retryTimer);
    }
    if (!retryRes.ok) throw new Error(`Retry ${model} HTTP ${retryRes.status}`);
    const d2 = await retryRes.json().catch(() => ({}));
    const c2 = d2?.choices?.[0]?.message?.content;
    if (typeof c2 !== "string" || !c2.trim()) throw new Error(`Call ${model} trả content rỗng (kể cả sau retry)`);
    callCount += 1;
    costLog.push(`${model} (retry 8k) · ${prompt.slice(0, 60).replace(/\n/g, " ")}…`);
    return c2.trim();
  }
  callCount += 1;
  costLog.push(`${model} · ${prompt.slice(0, 60).replace(/\n/g, " ")}…`);
  return content2.trim();
}

function imageToB64(relUrl: string): { b64: string; path: string } {
  // relUrl dạng /assets/img/img_08.jpg → public/assets/img/img_08.jpg
  const clean = relUrl.replace(/^\//, "");
  const p = path.resolve(PUBLIC_DIR, clean);
  if (!fs.existsSync(p)) throw new Error(`Ảnh không tồn tại: ${p}`);
  return { b64: fs.readFileSync(p).toString("base64"), path: p };
}

function write(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content + (content.endsWith("\n") ? "" : "\n"));
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npx tsx scripts/marketing/generate.ts <slug>");
    process.exit(1);
  }
  // env check (đảm bảo .env.local có đủ trước khi gọi API tốn tiền)
  marketingEnv();
  if (!loadSharedEnv().OPENCODE_GO_API_KEY) throw new Error("Thiếu OPENCODE_GO_API_KEY trong shared.env");

  const p = await loadProduct(slug);
  if (!p) {
    console.error(`Không tìm thấy sản phẩm: ${slug}`);
    process.exit(1);
  }
  console.log(`⚙️  Sinh marketing cho "${p.nameVi}" (${p.slug}) — ${p.media.length} ảnh`);

  const outDir = path.join(DRAFTS_DIR, slug);

  // 1) Text outputs: 5 loại × 2 lang
  for (const kind of ["listing", "web", "facebook", "tiktok", "story"] as const) {
    for (const lang of ["vi", "en"] as const) {
      const prompt = buildPrompt(kind, lang, p);
      const text = await callModel(TEXT_MODEL, prompt);
      write(path.join(outDir, `${kind}-${lang}.md`), text);
      console.log(`  ✓ ${kind}-${lang}`);
    }
  }

  // 2) SEO metadata × 2 lang (JSON)
  for (const lang of ["vi", "en"] as const) {
    const raw = await callModel(TEXT_MODEL, buildPrompt("seo", lang, p));
    let json: Record<string, string>;
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      json = JSON.parse(cleaned);
    } catch {
      json = { title: p.nameVi, description: raw.slice(0, 155) };
      console.warn(`  ⚠ seo-${lang}: không parse được JSON — fallback`);
    }
    if (!json.title || !json.description) throw new Error(`seo-${lang}: thiếu title/description`);
    if (json.title.length > 70) json.title = json.title.slice(0, 70);
    if (json.description.length > 165) json.description = json.description.slice(0, 165);
    write(path.join(outDir, `seo-${lang}.json`), JSON.stringify(json, null, 2));
    console.log(`  ✓ seo-${lang} (title ${json.title.length}ch)`);
  }

  // 3) Alt text cho từng ảnh (vision) × 2 lang
  const altLines: string[] = [];
  for (const m of p.media) {
    if (m.kind === "video") continue;
    const { b64 } = imageToB64(m.url);
    for (const lang of ["vi", "en"] as const) {
      const alt = await callModel(VISION_MODEL, buildAltPrompt(p, lang, m.url), b64);
      altLines.push(`${m.url} | ${lang} | ${alt.replace(/\n/g, " ")}`);
      console.log(`  ✓ alt ${m.url} ${lang}`);
    }
  }
  write(path.join(outDir, "alt.txt"), altLines.join("\n"));

  // 4) Log chi phí
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  const stamp = new Date().toISOString();
  const logEntry = [
    `## ${stamp} — ${slug} (${p.nameVi})`,
    `Tổng calls: ${callCount} (text ${TEXT_MODEL} + vision ${VISION_MODEL})`,
    ...costLog.map((c) => `- ${c}`),
    "",
  ].join("\n");
  fs.appendFileSync(LOG_FILE, logEntry + "\n");

  console.log(`\n✅ Xong: ${outDir} — ${callCount} calls model (xem .tmp/marketing-log.md)`);
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});

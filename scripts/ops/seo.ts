/**
 * P12T04 — sangops seo: audit SEO per-page (title/desc/canonical/hreflang/OG/JSON-LD/alt).
 * Usage: sangops seo
 */
import { type CmdContext } from "./sangops";

const BASE = "https://sangdupont.vercel.app";

async function fetchText(url: string, timeoutMs = 20000): Promise<{ status: number; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    return { status: res.status, text: await res.text() };
  } finally {
    clearTimeout(t);
  }
}

function metaAttr(html: string, attr: string, name: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

export async function seoCmd(_ctx: CmdContext, _args: string[]): Promise<number> {
  const sitemap = await fetchText(`${BASE}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error(`sitemap.xml HTTP ${sitemap.status}`);
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const issues: string[] = [];
  let pass = 0;
  const CONC = 4;
  for (let i = 0; i < urls.length; i += CONC) {
    const batch = urls.slice(i, i + CONC);
    const results = await Promise.all(
      batch.map(async (u) => {
        const r = await fetchText(u);
        if (r.status >= 400) return { url: u, problems: [`HTTP ${r.status}`] };
        const html = r.text;
        const problems: string[] = [];
        const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
        const desc = metaAttr(html, "name", "description");
        if (!title) problems.push("thiếu <title>");
        else if (title.length < 10) problems.push(`title quá ngắn (${title.length}ch)`);
        else if (title.length > 70) problems.push(`title dài (${title.length}ch > 70)`);
        if (!desc) problems.push("thiếu meta description");
        else if (desc.length < 50) problems.push(`description ngắn (${desc.length}ch < 50)`);
        else if (desc.length > 165) problems.push(`description dài (${desc.length}ch > 165)`);
        if (!html.includes('rel="canonical"')) problems.push("thiếu canonical");
        // Next 16 render hreflang dạng hrefLang (camelCase) — HTML attr case-insensitive nên check lowercase
        if (!html.toLowerCase().includes("hreflang")) problems.push("thiếu hreflang");
        if (!html.includes('property="og:title"') && !html.includes('name="og:title"')) problems.push("thiếu og:title");
        if (!html.includes("application/ld+json")) problems.push("thiếu JSON-LD");
        const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
        const noAlt = imgs.filter((src) => {
          const full = html.match(new RegExp(`<img[^>]+src=["']${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`));
          return full ? !/alt=["']/.test(full[0]) : false;
        });
        if (noAlt.length) problems.push(`${noAlt.length} ảnh thiếu alt`);
        return { url: u, problems };
      })
    );
    for (const r of results) {
      if (r.problems.length === 0) pass++;
      else issues.push(`${r.url} → ${r.problems.join("; ")}`);
    }
  }

  console.log(`  Đã audit ${urls.length} trang — ${pass} PASS`);
  if (issues.length === 0) {
    console.log("✅ SEO audit: không vấn đề nghiêm trọng");
    return 0;
  }
  console.log(`⚠️ ${issues.length} trang có vấn đề:`);
  for (const i of issues) console.log(`  - ${i}`);
  return 1;
}

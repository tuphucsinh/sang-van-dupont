/**
 * P12T04 — sangops links: crawl sitemap production → check link + ảnh hỏng.
 * Usage: sangops links
 */
import { type CmdContext } from "./sangops";

const BASE = "https://sangdupont.vercel.app";

async function fetchText(url: string, timeoutMs = 20000): Promise<{ status: number; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    const text = await res.text();
    return { status: res.status, text };
  } finally {
    clearTimeout(t);
  }
}

export async function linksCmd(_ctx: CmdContext, _args: string[]): Promise<number> {
  console.log("🔗 Crawl sitemap…");
  const sitemap = await fetchText(`${BASE}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error(`sitemap.xml HTTP ${sitemap.status}`);
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`  ${urls.length} URL trong sitemap`);

  const broken: string[] = [];
  let checked = 0;
  const CONC = 4;
  for (let i = 0; i < urls.length; i += CONC) {
    const batch = urls.slice(i, i + CONC);
    const results = await Promise.all(
      batch.map(async (u): Promise<{ url: string; status: number; badImgs: string[] }> => {
        const r = await fetchText(u);
        if (r.status >= 400) return { url: u, status: r.status, badImgs: [] };
        // ảnh trong trang
        const imgs = [...r.text.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
        const badImgs: string[] = [];
        for (const src of imgs.slice(0, 30)) {
          const abs = src.startsWith("http") ? src : `${BASE}${src}`;
          try {
            const ir = await fetchText(abs, 15000);
            if (ir.status >= 400) badImgs.push(`${abs} (${ir.status})`);
          } catch {
            badImgs.push(`${abs} (fetch fail)`);
          }
        }
        return { url: u, status: r.status, badImgs };
      })
    );
    for (const r of results) {
      checked++;
      if (r.status >= 400) broken.push(`${r.url} → HTTP ${r.status}`);
      if (r.badImgs.length) broken.push(`${r.url} → ảnh hỏng: ${r.badImgs.join(", ")}`);
    }
  }

  console.log(`  Đã check ${checked} trang`);
  if (broken.length === 0) {
    console.log("✅ Không có link/ảnh hỏng");
    return 0;
  }
  console.log(`❌ ${broken.length} vấn đề:`);
  for (const b of broken) console.log(`  - ${b}`);
  return 1;
}

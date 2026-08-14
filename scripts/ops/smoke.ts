/**
 * P12T05 — sangops smoke: post-deploy check HTTP routes + sitemap/robots.
 * Usage: sangops smoke
 */
import { type CmdContext } from "./sangops";

const BASE = "https://sangdupont.vercel.app";

const ROUTES: { path: string; expect: number }[] = [
  { path: "/", expect: 200 },
  { path: "/vi", expect: 200 },
  { path: "/en", expect: 200 },
  { path: "/vi/products/black-lacquer", expect: 200 },
  { path: "/en/products/black-lacquer", expect: 200 },
  { path: "/admin", expect: 200 },
  { path: "/vi/khong-ton-tai", expect: 404 }, // trang lạ → 404 chuẩn
  { path: "/sitemap.xml", expect: 200 },
  { path: "/robots.txt", expect: 200 },
];

async function check(path: string, expect: number): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal, redirect: "follow" });
    const ok = res.status === expect;
    return `${ok ? "✅" : "❌"} ${path} → ${res.status} (expect ${expect})`;
  } catch (e) {
    return `❌ ${path} → fetch fail: ${(e as Error).message}`;
  } finally {
    clearTimeout(t);
  }
}

export async function smokeCmd(_ctx: CmdContext, _args: string[]): Promise<number> {
  console.log(`🚀 Smoke test ${BASE}`);
  const results = await Promise.all(ROUTES.map((r) => check(r.path, r.expect)));
  for (const r of results) console.log(`  ${r}`);

  // robots.txt phải disallow /admin
  const robots = await fetch(`${BASE}/robots.txt`).then((r) => r.text()).catch(() => "");
  const disallowAdmin = /disallow:\s*\/admin/i.test(robots);
  console.log(`  ${disallowAdmin ? "✅" : "❌"} robots.txt disallow /admin`);

  const fail = results.filter((r) => r.startsWith("❌")).length + (disallowAdmin ? 0 : 1);
  if (fail === 0) {
    console.log("✅ SMOKE PASS");
    return 0;
  }
  console.log(`❌ SMOKE FAIL (${fail} vấn đề)`);
  return 1;
}

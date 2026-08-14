/**
 * P12T02 — sangops: CLI vận hành website SangDupont (Hermes nội bộ / sangbot).
 * Usage: npx tsx scripts/ops/sangops.ts <cmd> [args]
 * Subcommands: products | links | i18n | seo | smoke | ci | publish | rollback
 * Guard: push/deploy/delete → chờ anh duyệt (log + hỏi trước khi thực thi production).
 */
import fs from "node:fs";
import path from "node:path";
import { productsCmd } from "./products";
import { publishCmd } from "./publish";
import { linksCmd } from "./links";
import { i18nCmd } from "./i18n";
import { seoCmd } from "./seo";

const OPS_LOG = path.resolve(process.cwd(), ".tmp/ops.log");

export function logOp(cmd: string, detail: string) {
  const line = `[${new Date().toISOString()}] ${cmd} — ${detail}`;
  fs.mkdirSync(path.dirname(OPS_LOG), { recursive: true });
  fs.appendFileSync(OPS_LOG, line + "\n");
  console.log(line);
}

export function loadEnvFile(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !m[1].startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export function sangopsEnv(): { url: string; key: string } {
  const env = loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  }
  return { url, key };
}

export interface CmdContext {
  env: { url: string; key: string };
}

const REGISTRY: { name: string; desc: string; impl?: (ctx: CmdContext, args: string[]) => Promise<number>; task: string }[] = [
  { name: "products", desc: "CRUD sản phẩm (list|get|create|update|delete) — delete confirm 2 bước", impl: productsCmd, task: "P12T03" },
  { name: "publish", desc: "Build + deploy production (vercel --prod) — CHỜ ANH DUYỆT", impl: publishCmd, task: "P12T03" },
  { name: "links", desc: "Crawl sitemap → check link/ảnh hỏng", impl: linksCmd, task: "P12T04" },
  { name: "i18n", desc: "So sánh nội dung VI/EN trong DB", impl: i18nCmd, task: "P12T04" },
  { name: "seo", desc: "Audit SEO per-page (title/desc/canonical/hreflang/OG/JSON-LD/alt)", impl: seoCmd, task: "P12T04" },
  { name: "smoke", desc: "Post-deploy: HTTP routes + CDP NO_JS_ERRORS + sitemap/robots", task: "P12T05" },
  { name: "ci", desc: "Theo dõi GitHub Actions (gh run list/view --log-failed)", task: "P12T05" },
  { name: "rollback", desc: "Chuẩn bị rollback (dry-run) — thực thi chỉ khi anh duyệt", task: "P12T05" },
];

function usage() {
  console.log("sangops — CLI vận hành SangDupont\n");
  console.log("Usage: npx tsx scripts/ops/sangops.ts <cmd> [args]\n");
  console.log("Subcommands:");
  for (const r of REGISTRY) console.log(`  ${r.name.padEnd(10)} ${r.desc} [${r.task}]`);
  console.log("\nGuard: push/deploy/delete = CHỜ ANH DUYỆT qua Telegram. Mọi write log vào .tmp/ops.log");
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === "--help" || cmd === "-h") {
    usage();
    process.exit(cmd ? 0 : 1);
  }
  const reg = REGISTRY.find((r) => r.name === cmd);
  if (!reg) {
    console.error(`Lệnh lạ: "${cmd}" — xem --help`);
    process.exit(1);
  }
  if (!reg.impl) {
    console.error(`[${reg.name}] chưa implement — thuộc task ${reg.task}`);
    process.exit(1);
  }
  const env = sangopsEnv();
  const rc = await reg.impl({ env }, process.argv.slice(3));
  process.exit(rc ?? 0);
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});

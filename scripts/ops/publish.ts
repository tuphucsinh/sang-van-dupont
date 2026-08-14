/**
 * P12T03 — sangops publish: build + deploy production qua Vercel CLI.
 * GUARD: chỉ chạy khi anh duyệt — CLI yêu cầu --confirm (Hermes chỉ chạy sau khi anh "ok").
 * Usage: sangops publish [--confirm]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { logOp, type CmdContext } from "./sangops";

export async function publishCmd(_ctx: CmdContext, args: string[]): Promise<number> {
  if (!args.includes("--confirm")) {
    console.error("⛔ publish = deploy PRODUCTION — CHỜ ANH DUYỆT. Chạy lại với --confirm chỉ khi anh đã 'ok' qua Telegram.");
    return 1;
  }
  logOp("publish", "bắt đầu build + vercel --prod (anh đã duyệt)");

  // Backup artifact out/ hiện tại trước khi build mới (rollback đường B — Reviewer góp ý 1)
  const outDir = path.resolve(process.cwd(), "out");
  if (fs.existsSync(outDir)) {
    const sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const artifactDir = path.resolve(process.cwd(), ".tmp/artifacts");
    fs.mkdirSync(artifactDir, { recursive: true });
    const tarPath = path.join(artifactDir, `out-${sha}.tar.gz`);
    execSync(`tar -czf "${tarPath}" -C "${path.dirname(outDir)}" out`, { stdio: "ignore" });
    logOp("publish", `backup out/ → ${tarPath}`);
    console.log(`📦 Backup artifact cũ: ${tarPath}`);
  } else {
    console.warn("⚠️ Không thấy out/ hiện tại — bỏ qua backup artifact (lần publish đầu?)");
  }

  console.log("🏗️  Build production…");
  execSync("npm run build", { stdio: "inherit", cwd: process.cwd() });
  console.log("🚀 Deploy Vercel…");
  execSync("vercel --prod --yes", { stdio: "inherit", cwd: process.cwd() });
  logOp("publish", "deploy xong — chạy smoke (sangops smoke)");
  console.log("✅ Deploy xong. Chạy: npm run ops -- smoke");
  return 0;
}

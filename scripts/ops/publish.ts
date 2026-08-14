/**
 * P12T03 — sangops publish: build + deploy production qua Vercel CLI.
 * GUARD: chỉ chạy khi anh duyệt — CLI yêu cầu --confirm (Hermes chỉ chạy sau khi anh "ok").
 * Usage: sangops publish [--confirm]
 */
import { execSync } from "node:child_process";
import { logOp, type CmdContext } from "./sangops";

export async function publishCmd(_ctx: CmdContext, args: string[]): Promise<number> {
  if (!args.includes("--confirm")) {
    console.error("⛔ publish = deploy PRODUCTION — CHỜ ANH DUYỆT. Chạy lại với --confirm chỉ khi anh đã 'ok' qua Telegram.");
    return 1;
  }
  logOp("publish", "bắt đầu build + vercel --prod (anh đã duyệt)");
  console.log("🏗️  Build production…");
  execSync("npm run build", { stdio: "inherit", cwd: process.cwd() });
  console.log("🚀 Deploy Vercel…");
  execSync("vercel --prod --yes", { stdio: "inherit", cwd: process.cwd() });
  logOp("publish", "deploy xong — chạy smoke (sangops smoke)");
  console.log("✅ Deploy xong. Chạy: npm run ops -- smoke");
  return 0;
}

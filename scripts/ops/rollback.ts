/**
 * P12T05 — sangops rollback: dry-run kế hoạch rollback (KHÔNG thực thi production).
 * Usage: sangops rollback
 * Thực thi thật chỉ khi anh duyệt (xem .ai/OPERATIONS.md — 3 đường rollback).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { type CmdContext } from "./sangops";

export async function rollbackCmd(_ctx: CmdContext, _args: string[]): Promise<number> {
  console.log("🛟 ROLLBACK PLAN (dry-run — chưa thực thi gì)");
  console.log("==============================================");

  let head = "";
  try {
    head = execSync("git log -1 --oneline", { encoding: "utf8" }).trim();
    console.log(`\n📍 Commit hiện tại: ${head}`);
  } catch {
    console.log("\n⚠️ Không đọc được git (chạy từ project root?)");
  }

  const backupScript = path.resolve(process.cwd(), "scripts/db-backup.sh");
  console.log("\n📦 Backup DB:");
  console.log(`  ${fs.existsSync(backupScript) ? "✅" : "⚠️"} scripts/db-backup.sh ${fs.existsSync(backupScript) ? "có sẵn (backup thủ công)" : "KHÔNG thấy"}`);
  console.log("  Cron CN 08:00 tự backup giữ 7 bản (supabase_keepalive_backup.py)");

  console.log("\n🛣️ 3 đường rollback (chọn theo loại lỗi):");
  console.log("  A. Code/content lỗi từ commit mới → git revert <bad_sha> + build + push (CHỜ ANH DUYỆT push)");
  console.log("  B. Deploy mới hỏng → redeploy artifact/out cũ (vd tag v1.0-release-a) — luôn giữ out/ cũ trước khi publish");
  console.log("  C. Data lỗi (xóa nhầm/sai giá) → restore backup DB mới nhất (backup trước khi restore!)");
  console.log("\n⛔ Để THỰC THI một đường: anh duyệt cụ thể → thực hiện thủ công theo .ai/OPERATIONS.md §4");

  return 0;
}

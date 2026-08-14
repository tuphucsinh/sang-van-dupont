/**
 * P12T05 — sangops ci: theo dõi GitHub Actions (gh CLI).
 * Usage: sangops ci
 */
import { execSync } from "node:child_process";
import { type CmdContext } from "./sangops";

export async function ciCmd(_ctx: CmdContext, _args: string[]): Promise<number> {
  try {
    const list = execSync("gh run list -L 5", { encoding: "utf8", timeout: 30000 });
    console.log("📋 5 runs gần nhất:");
    console.log(list.trim());
    // run mới nhất failed → lấy log lỗi
    const firstLine = list.trim().split("\n")[1];
    const failedMatch = list.match(/^\s*\S+\s+(\S+)\s+failed/m);
    if (failedMatch) {
      const id = failedMatch[1];
      console.log(`\n🔍 Run ${id} FAILED — log lỗi:`);
      try {
        const log = execSync(`gh run view ${id} --log-failed`, { encoding: "utf8", timeout: 60000 });
        console.log(log.slice(0, 4000));
      } catch (e) {
        console.log("(không lấy được --log-failed:", (e as Error).message, ")");
      }
      return 1;
    }
    console.log("\n✅ Không có run failed trong 5 gần nhất");
    return 0;
  } catch (e) {
    const msg = (e as Error).message;
    if (/gh: not found|command not found/.test(msg)) {
      console.error("❌ gh CLI chưa cài (GitHub CLI)");
    } else if (/auth|GH_TOKEN|not logged/.test(msg)) {
      console.error("❌ gh chưa auth — chạy `gh auth login` hoặc set GH_TOKEN");
    } else {
      console.error("❌ Lỗi gh:", msg.split("\n").slice(0, 3).join("\n"));
    }
    return 1;
  }
}

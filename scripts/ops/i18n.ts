/**
 * P12T04 — sangops i18n: so sánh nội dung VI/EN trong DB.
 * Usage: sangops i18n
 */
import { createClient } from "@supabase/supabase-js";
import { type CmdContext } from "./sangops";

const TABLES: { table: string; pairs: [string, string][] }[] = [
  { table: "products", pairs: [["name_vi", "name_en"], ["desc_vi", "desc_en"]] },
  { table: "services", pairs: [["name_vi", "name_en"], ["desc_vi", "desc_en"]] },
  { table: "faq", pairs: [["question_vi", "question_en"], ["answer_vi", "answer_en"]] },
  { table: "testimonials", pairs: [["name_vi", "name_en"], ["content_vi", "content_en"]] },
  { table: "case_studies", pairs: [["title_vi", "title_en"], ["body_vi", "body_en"]] },
];

export async function i18nCmd(ctx: CmdContext, _args: string[]): Promise<number> {
  const supabase = createClient(ctx.env.url, ctx.env.key);
  const issues: string[] = [];
  let checked = 0;

  for (const { table, pairs } of TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      // bảng có thể chưa có cột — bỏ qua lỗi cột, chỉ báo lỗi query thật
      if (error.message.includes("column") || error.message.includes("does not exist")) continue;
      throw new Error(`${table} query fail: ${error.message}`);
    }
    for (const row of data ?? []) {
      checked++;
      for (const [vi, en] of pairs) {
        const v = String(row[vi] ?? "").trim();
        const e = String(row[en] ?? "").trim();
        const label = `${table}.${vi} (id=${String(row.id).slice(0, 8)})`;
        if (!v && !e) continue;
        if (!v || !e) {
          issues.push(`${label}: ${!v ? "THIẾU VI" : "THIẾU EN"}`);
        } else if (v.length > 40 && e.length < v.length * 0.3) {
          issues.push(`${label}: EN quá ngắn (${e.length}ch vs VI ${v.length}ch)`);
        }
      }
    }
  }

  console.log(`  Đã check ${checked} dòng nội dung`);
  if (issues.length === 0) {
    console.log("✅ VI/EN khớp — không lệch đáng kể");
    return 0;
  }
  console.log(`⚠️ ${issues.length} lệch:`);
  for (const i of issues) console.log(`  - ${i}`);
  return 1;
}

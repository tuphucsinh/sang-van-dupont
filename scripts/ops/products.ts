/**
 * P12T03 — sangops products: CRUD qua service role (internal).
 * delete: confirm 2 bước (phải gõ lại slug). Guard: delete = write production → log + confirm.
 * Usage: sangops products list|get <slug>|create <json>|update <slug> <json>|delete <slug>
 */
import { createClient } from "@supabase/supabase-js";
import { logOp, type CmdContext } from "./sangops";

const STATUSES = ["draft", "available", "reserved", "sold", "archived"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseJsonArg(raw: string): Record<string, unknown> {
  if (raw.startsWith("{")) return JSON.parse(raw);
  const fs = require("node:fs") as typeof import("node:fs");
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, "utf8"));
  throw new Error("Tham số JSON không hợp lệ (cần JSON inline hoặc path file)");
}

function validateProduct(data: Record<string, unknown>): void {
  if (data.slug !== undefined && typeof data.slug !== "string") throw new Error("slug phải là string");
  if (data.status !== undefined && !STATUSES.includes(String(data.status))) {
    throw new Error(`status phải ∈ ${STATUSES.join("|")}`);
  }
  if (data.price !== undefined && data.price !== null) {
    const n = Number(data.price);
    if (!Number.isFinite(n) || n < 0) throw new Error("price phải là số ≥ 0 hoặc null");
  }
}

export async function productsCmd(ctx: CmdContext, args: string[]): Promise<number> {
  const sub = args[0];
  const supabase = createClient(ctx.env.url, ctx.env.key);

  if (!sub || sub === "list") {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name_vi, name_en, status, price, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`list fail: ${error.message}`);
    console.table(data?.map((p) => ({ slug: p.slug, name_vi: p.name_vi, status: p.status, price: p.price ?? "Liên hệ" })));
    return 0;
  }

  if (sub === "get") {
    const slug = args[1];
    if (!slug) throw new Error("products get <slug>");
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(`get fail: ${error.message}`);
    if (!data) {
      console.error(`Không tìm thấy: ${slug}`);
      return 1;
    }
    console.log(JSON.stringify(data, null, 2));
    return 0;
  }

  if (sub === "create") {
    const raw = args[1];
    if (!raw) throw new Error("products create <json|file> — tối thiểu slug, name_vi, name_en, status");
    const data = parseJsonArg(raw);
    if (!data.slug || !data.name_vi || !data.name_en) throw new Error("Thiếu slug/name_vi/name_en");
    validateProduct(data);
    const { data: row, error } = await supabase
      .from("products")
      .insert({ ...data, slug: slugify(String(data.slug)) })
      .select("id, slug, status")
      .single();
    if (error) throw new Error(`create fail: ${error.message}`);
    logOp("products create", `slug=${row.slug} status=${row.status}`);
    console.log(`✅ Đã tạo: ${row.slug} (${row.id})`);
    return 0;
  }

  if (sub === "update") {
    const slug = args[1];
    const raw = args[2];
    if (!slug || !raw) throw new Error("products update <slug> <json|file>");
    const data = parseJsonArg(raw);
    if (data.slug !== undefined) delete data.slug; // không đổi slug qua update
    validateProduct(data);
    const { data: row, error } = await supabase.from("products").update(data).eq("slug", slug).select("slug, status").maybeSingle();
    if (error) throw new Error(`update fail: ${error.message}`);
    if (!row) {
      console.error(`Không tìm thấy: ${slug}`);
      return 1;
    }
    logOp("products update", `slug=${slug} fields=${Object.keys(data).join(",")}`);
    console.log(`✅ Đã cập nhật: ${slug}`);
    return 0;
  }

  if (sub === "delete") {
    const slug = args[1];
    const confirm = args[2];
    const force = args[3] === "--force";
    if (!slug) throw new Error("products delete <slug> <gõ-lại-slug-để-xác-nhận> [--force]");
    if (confirm !== slug) {
      console.error(`❌ Confirm 2 bước: phải gõ lại đúng slug "${slug}" làm tham số 2 (hiện: "${confirm ?? ""}")`);
      return 1;
    }
    // Mặc định SOFT-DELETE (status=archived) — reversible (Reviewer góp ý 2); hard chỉ khi --force
    if (!force) {
      const { data: row, error } = await supabase
        .from("products")
        .update({ status: "archived" })
        .eq("slug", slug)
        .select("id, status")
        .maybeSingle();
      if (error) throw new Error(`soft-delete fail: ${error.message}`);
      if (!row) {
        console.error(`Không tìm thấy: ${slug}`);
        return 1;
      }
      logOp("products delete (soft)", `slug=${slug} → status=archived`);
      console.log(`🗂️ Đã soft-delete (archived): ${slug} — có thể khôi phục qua update. Muốn xóa hẳn: thêm --force`);
      return 0;
    }
    const { data: row, error } = await supabase.from("products").delete().eq("slug", slug).select("id").maybeSingle();
    if (error) throw new Error(`delete fail: ${error.message}`);
    if (!row) {
      console.error(`Không tìm thấy: ${slug}`);
      return 1;
    }
    logOp("products delete (hard --force)", `slug=${slug} id=${row.id}`);
    console.log(`🗑️ Đã xóa hẳn: ${slug}`);
    return 0;
  }

  throw new Error(`products subcommand lạ: ${sub} (list|get|create|update|delete)`);
}

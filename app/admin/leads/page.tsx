"use client";

import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

interface LeadAttachment {
  id: string;
  storage_path: string;
  storage_bucket: string;
}

interface LeadRow {
  id: string;
  type: "buy" | "maintenance";
  name: string | null;
  phone: string | null;
  budget: string | null;
  need: string | null;
  line_interest: string | null;
  channel: string | null;
  status: string;
  meta: unknown | null;
  created_at: string;
  lead_attachments: LeadAttachment[];
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

const STATUS_OPTIONS = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "qualified", label: "Tiềm năng" },
  { value: "won", label: "Thành công" },
  { value: "lost", label: "Đã hủy" },
];

export default function AdminLeadsPage() {
  const isMobile = useIsMobile();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const showToastMsg = useCallback((type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, 3000);
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*, lead_attachments(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads((data as LeadRow[]) || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lead:", err);
      showToastMsg("err", errMsg(err) || "Không thể tải danh sách lead");
    } finally {
      setLoading(false);
    }
  }, [showToastMsg]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadLeads();
    }, 0);
    return () => clearTimeout(t);
  }, [loadLeads]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    setUpdating(leadId);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;
      showToastMsg("ok", "Cập nhật trạng thái thành công");
      await loadLeads();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      showToastMsg("err", errMsg(err) || "Không thể cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  const handleDownloadAttachment = async (attachment: LeadAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from(attachment.storage_bucket)
        .createSignedUrl(attachment.storage_path, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      } else {
        throw new Error("Không thể tạo URL tải tệp đính kèm");
      }
    } catch (err) {
      console.error("Lỗi khi tải đính kèm:", err);
      showToastMsg("err", errMsg(err) || "Lỗi tải ảnh đính kèm");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredLeads =
    statusFilter === "all"
      ? leads
      : leads.filter((l) => l.status === statusFilter);

  const hasMetaContent = (meta: unknown): boolean => {
    if (!meta) return false;
    if (typeof meta === "object") {
      return Object.keys(meta as Record<string, unknown>).length > 0;
    }
    return true;
  };

  return (
    <AdminGuard>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0d",
          color: "#f3ecd9",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "32px 24px 80px",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobile ? "12px" : undefined }}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "32px",
              paddingBottom: "20px",
              borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Cinzel, serif",
                  color: "#d4af37",
                  fontSize: "28px",
                  margin: 0,
                  letterSpacing: "0.04em",
                }}
              >
                Quản lý lead
              </h1>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "rgba(243, 236, 217, 0.6)",
                }}
              >
                Tổng số {leads.length} lead trong cơ sở dữ liệu
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/admin/products"
                style={{
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  color: "#d4af37",
                  background: "transparent",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                ← Về sản phẩm
              </Link>

              <button
                onClick={handleSignOut}
                style={{
                  border: "1px solid rgba(220, 38, 38, 0.4)",
                  color: "#ef4444",
                  background: "transparent",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Đăng xuất
              </button>
            </div>
          </header>

          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "24px",
              background: "#101014",
              border: "1px solid rgba(212, 175, 55, 0.15)",
              borderRadius: "8px",
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label
                htmlFor="status-filter-select"
                style={{
                  fontSize: "14px",
                  color: "rgba(243, 236, 217, 0.7)",
                  fontWeight: 500,
                }}
              >
                Lọc trạng thái:
              </label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: "#0a0a0d",
                  color: "#f3ecd9",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Tất cả ({leads.length})</option>
                {STATUS_OPTIONS.map((opt) => {
                  const count = leads.filter((l) => l.status === opt.value).length;
                  return (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "rgba(243, 236, 217, 0.5)",
              }}
            >
              Hiển thị {filteredLeads.length} / {leads.length} lead
            </div>
          </div>

          {/* Lead List */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "rgba(243, 236, 217, 0.6)",
                fontSize: "16px",
              }}
            >
              Đang tải danh sách lead…
            </div>
          ) : filteredLeads.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: isMobile ? "20px" : "40px",
                color: "rgba(243, 236, 217, 0.5)",
                fontSize: "15px",
                background: "#101014",
                borderRadius: "8px",
                border: "1px dashed rgba(212, 175, 55, 0.2)",
              }}
            >
              Chưa có lead nào
            </div>
          ) : (
            <div>
              {filteredLeads.map((lead) => {
                const isUpdating = updating === lead.id;
                const isBuy = lead.type === "buy";

                return (
                  <div
                    key={lead.id}
                    style={{
                      background: "#101014",
                      border: "1px solid rgba(212, 175, 55, 0.15)",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {/* Top Row: Type Badge + Status Select + Created At */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isBuy ? (
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "3px 10px",
                              borderRadius: "4px",
                              background: "rgba(212, 175, 55, 0.15)",
                              color: "#d4af37",
                              border: "1px solid rgba(212, 175, 55, 0.4)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Mua
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "3px 10px",
                              borderRadius: "4px",
                              background: "rgba(168, 85, 247, 0.15)",
                              color: "#c084fc",
                              border: "1px solid rgba(168, 85, 247, 0.4)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Bảo dưỡng
                          </span>
                        )}

                        <select
                          value={lead.status}
                          disabled={isUpdating}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          style={{
                            background: "#0a0a0d",
                            color: "#f3ecd9",
                            border: "1px solid rgba(212, 175, 55, 0.3)",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "13px",
                            cursor: isUpdating ? "not-allowed" : "pointer",
                            opacity: isUpdating ? 0.6 : 1,
                            outline: "none",
                          }}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <span style={{ fontSize: "12px", color: "#d4af37" }}>
                            Đang lưu…
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(243, 236, 217, 0.5)",
                        }}
                      >
                        {formatDate(lead.created_at)}
                      </div>
                    </div>

                    {/* Customer Info: Name + Phone + Channel */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#f3ecd9",
                        }}
                      >
                        {lead.name || "Khách ẩn danh"}
                      </span>

                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          style={{
                            color: "#d4af37",
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: "14px",
                          }}
                        >
                          📞 {lead.phone}
                        </a>
                      )}

                      {lead.channel && (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "rgba(243, 236, 217, 0.5)",
                          }}
                        >
                          • Kênh: {lead.channel}
                        </span>
                      )}
                    </div>

                    {/* Details: Budget + Need + Line Interest */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "14px",
                      }}
                    >
                      {lead.budget && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "rgba(243, 236, 217, 0.5)", minWidth: "120px" }}>
                            Ngân sách:
                          </span>
                          <span style={{ color: "#f3ecd9" }}>{lead.budget}</span>
                        </div>
                      )}

                      {lead.line_interest && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "rgba(243, 236, 217, 0.5)", minWidth: "120px" }}>
                            Dòng quan tâm:
                          </span>
                          <span style={{ color: "#f3ecd9" }}>{lead.line_interest}</span>
                        </div>
                      )}

                      {lead.need && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "rgba(243, 236, 217, 0.5)", minWidth: "120px" }}>
                            Nhu cầu:
                          </span>
                          <span style={{ color: "#f3ecd9", wordBreak: "break-word" }}>
                            {lead.need}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta JSON if present */}
                    {hasMetaContent(lead.meta) && (
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "rgba(243, 236, 217, 0.5)",
                            marginBottom: "4px",
                          }}
                        >
                          Thông tin bổ sung (meta):
                        </div>
                        <pre
                          style={{
                            fontFamily: "monospace",
                            background: "#0a0a0d",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            overflowX: "auto",
                            border: "1px solid rgba(212, 175, 55, 0.1)",
                            color: "rgba(243, 236, 217, 0.8)",
                            margin: 0,
                          }}
                        >
                          {JSON.stringify(lead.meta, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Attachments if present */}
                    {lead.lead_attachments && lead.lead_attachments.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "rgba(243, 236, 217, 0.5)",
                          }}
                        >
                          Tệp đính kèm ({lead.lead_attachments.length}):
                        </span>
                        {lead.lead_attachments.map((att, idx) => (
                          <button
                            key={att.id || idx}
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            style={{
                              background: "rgba(212, 175, 55, 0.1)",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              color: "#d4af37",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            📎 Tải ảnh {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              background: toast.type === "ok" ? "#16a34a" : "#dc2626",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              fontSize: "14px",
              fontWeight: 500,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              maxWidth: "400px",
            }}
          >
            <span>{toast.type === "ok" ? "✓" : "✕"}</span>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

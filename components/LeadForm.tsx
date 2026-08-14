"use client";

import { useState } from "react";

const FUNC_URL = "https://iloaeaoojxdovedjtowt.supabase.co/functions/v1/create-lead";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface FormData {
  type: "buy" | "maintenance";
  name: string;
  phone: string;
  budget: string;
  need: string;
  line_interest: string;
  channel: string;
}

const initialForm: FormData = {
  type: "buy",
  name: "",
  phone: "",
  budget: "",
  need: "",
  line_interest: "",
  channel: "web_form",
};

export default function LeadForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [consent, setConsent] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [requestCode, setRequestCode] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validImages = selectedFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= 1.5 * 1024 * 1024
    );
    setAttachments((prev) => [...prev, ...validImages].slice(0, 3));
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setForm(initialForm);
    setAttachments([]);
    setConsent(false);
    setStatus("idle");
    setErrorMsg("");
    setRequestCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName) {
      setStatus("error");
      setErrorMsg("Vui lòng nhập họ và tên.");
      return;
    }

    if (!/^[0-9+\s-]{8,15}$/.test(trimmedPhone)) {
      setStatus("error");
      setErrorMsg("Số điện thoại không hợp lệ (8–15 chữ số).");
      return;
    }

    if (form.type === "maintenance" && !consent) {
      setStatus("error");
      setErrorMsg("Vui lòng đồng ý chia sẻ thông tin");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      let b64List: string[] = [];
      if (form.type === "maintenance" && attachments.length > 0) {
        const toBase64 = (f: File) =>
          new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result).split(",")[1] || "");
            r.onerror = rej;
            r.readAsDataURL(f);
          });
        b64List = await Promise.all(attachments.map(toBase64));
      }

      const res = await fetch(FUNC_URL, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: "Bearer " + ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: trimmedName,
          phone: trimmedPhone,
          channel: form.channel || "web_form",
          ...(form.type === "maintenance" && attachments.length > 0
            ? {
                attachments: attachments.map((f, i) => ({
                  name: f.name,
                  base64: b64List[i],
                })),
              }
            : {}),
        }),
      });

      const d = await res.json();
      if (res.ok && d.ok) {
        setRequestCode(d.request_code || "");
        setStatus("success");
        setAttachments([]);
        setConsent(false);
      } else {
        setStatus("error");
        setErrorMsg(d.error || "Lỗi gửi");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Không kết nối được — thử lại");
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    color: "#a89f8a",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0a0a0d",
    color: "#f3ecd9",
    border: "1px solid rgba(212, 175, 55, 0.25)",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div
      style={{
        background: "#101014",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "560px",
        margin: "32px auto 0",
        boxSizing: "border-box",
      }}
    >
      <h3
        style={{
          color: "#d4af37",
          fontFamily: "var(--font-serif, Georgia, serif)",
          fontSize: "1.3rem",
          marginBottom: "16px",
          marginTop: 0,
          textAlign: "center",
        }}
      >
        Gửi yêu cầu tư vấn
      </h3>

      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p
            style={{
              color: "#d4af37",
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "0 0 12px",
            }}
          >
            ✅ Đã nhận yêu cầu
          </p>
          <p style={{ color: "#f3ecd9", margin: "0 0 8px", fontSize: "0.95rem" }}>
            Mã yêu cầu: <b>#{requestCode}</b>
          </p>
          <p style={{ color: "#a89f8a", margin: "0 0 20px", fontSize: "0.9rem" }}>
            Mình sẽ liên hệ lại sớm nhất.
          </p>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "transparent",
              border: "1px solid #d4af37",
              color: "#d4af37",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Gửi yêu cầu khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            {/* Row 1: Type + Name */}
            <div>
              <label htmlFor="lead-type" style={labelStyle}>
                Loại yêu cầu
              </label>
              <select
                id="lead-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="buy">Mua</option>
                <option value="maintenance">Bảo dưỡng</option>
              </select>
            </div>

            <div>
              <label htmlFor="lead-name" style={labelStyle}>
                Tên *
              </label>
              <input
                id="lead-name"
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Họ và tên của bạn"
                style={inputStyle}
              />
            </div>

            {/* Row 2: Phone + Budget */}
            <div>
              <label htmlFor="lead-phone" style={labelStyle}>
                ĐT / Zalo *
              </label>
              <input
                id="lead-phone"
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="0905 xxx xxx"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="lead-budget" style={labelStyle}>
                Ngân sách
              </label>
              <select
                id="lead-budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">-- Chọn ngân sách --</option>
                <option value="< 5 triệu">&lt; 5 triệu</option>
                <option value="5–10 triệu">5–10 triệu</option>
                <option value="10–20 triệu">10–20 triệu</option>
                <option value="20–50 triệu">20–50 triệu</option>
                <option value="> 50 triệu">&gt; 50 triệu</option>
              </select>
            </div>

            {/* Row 3: Line of interest + Channel */}
            <div>
              <label htmlFor="lead-line-interest" style={labelStyle}>
                Dòng quan tâm
              </label>
              <input
                id="lead-line-interest"
                type="text"
                name="line_interest"
                value={form.line_interest}
                onChange={handleChange}
                placeholder="Ligne 2, Gatsby…"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="lead-channel" style={labelStyle}>
                Kênh liên hệ ưu tiên
              </label>
              <select
                id="lead-channel"
                name="channel"
                value={form.channel}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="web_form">Form web</option>
                <option value="Zalo">Zalo</option>
                <option value="Telegram">Telegram</option>
                <option value="Call">Gọi điện thoại</option>
                <option value="Inbox FB">Inbox FB</option>
              </select>
            </div>
          </div>

          {/* Full width: Need */}
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="lead-need" style={labelStyle}>
              Nhu cầu chi tiết
            </label>
            <textarea
              id="lead-need"
              name="need"
              rows={3}
              value={form.need}
              onChange={handleChange}
              placeholder="Mô tả tình trạng bật lửa, mẫu bạn tìm kiếm, hoặc câu hỏi chi tiết..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {form.type === "maintenance" && (
            <>
              {/* Attachments */}
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="lead-attachments" style={labelStyle}>
                  Ảnh sản phẩm (tối đa 3)
                </label>
                <input
                  id="lead-attachments"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{
                    ...inputStyle,
                    padding: "8px",
                    cursor: "pointer",
                  }}
                />
                {attachments.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#0a0a0d",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          border: "1px solid rgba(212, 175, 55, 0.2)",
                          fontSize: "0.85rem",
                          color: "#f3ecd9",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginRight: "8px",
                          }}
                        >
                          📷 {file.name} ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            padding: "2px 6px",
                          }}
                        >
                          ✕ Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent checkbox */}
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  id="lead-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label
                  htmlFor="lead-consent"
                  style={{
                    fontSize: "0.85rem",
                    color: "#f3ecd9",
                    cursor: "pointer",
                  }}
                >
                  Tôi đồng ý cung cấp thông tin và ảnh để được hỗ trợ bảo dưỡng
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              width: "100%",
              background: "#d4af37",
              color: "#0a0a0d",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
              cursor: status === "sending" ? "not-allowed" : "pointer",
              opacity: status === "sending" ? 0.7 : 1,
              fontSize: "1rem",
              transition: "opacity 0.2s",
            }}
          >
            {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu"}
          </button>

          {status === "error" && errorMsg && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.9rem",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

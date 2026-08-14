"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "./Ga4";

const FUNC_URL = "https://iloaeaoojxdovedjtowt.supabase.co/functions/v1/create-lead";
const VISION_URL = "https://iloaeaoojxdovedjtowt.supabase.co/functions/v1/vision-intake";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const T = {
  vi: {
    title: "Gửi yêu cầu tư vấn",
    typeLabel: "Loại yêu cầu",
    typeBuy: "Mua",
    typeMaintenance: "Bảo dưỡng",
    nameLabel: "Tên *",
    namePh: "Họ và tên của bạn",
    phoneLabel: "ĐT / Zalo *",
    phonePh: "0905 xxx xxx",
    budgetLabel: "Ngân sách",
    budgetPh: "-- Chọn ngân sách --",
    budgetUnder5m: "< 5 triệu",
    budget5to10m: "5–10 triệu",
    budget10to20m: "10–20 triệu",
    budget20to50m: "20–50 triệu",
    budgetOver50m: "> 50 triệu",
    lineLabel: "Dòng quan tâm",
    linePh: "Ligne 2, Gatsby…",
    channelLabel: "Kênh liên hệ ưu tiên",
    channelZalo: "Zalo",
    channelTelegram: "Telegram",
    channelCall: "Điện thoại",
    channelWhatsApp: "WhatsApp",
    needLabel: "Nhu cầu chi tiết",
    needPh: "Mô tả tình trạng bật lửa, mẫu bạn tìm kiếm, hoặc câu hỏi chi tiết...",
    uploadLabel: "Gửi ảnh bật lửa (tối đa 3 ảnh, ≤1.5MB/ảnh)",
    removeFile: "✕ Xóa",
    aiLoading: "🤖 AI đang xem ảnh...",
    aiLabel: "🤖 AI nhận xét sơ bộ:",
    aiErr: "AI chưa nhận xét được — không sao, vẫn gửi được",
    consentText: "Tôi đồng ý cung cấp thông tin và ảnh để được hỗ trợ bảo dưỡng",
    submit: "Gửi yêu cầu",
    sending: "Đang gửi…",
    successTitle: "✅ Đã nhận yêu cầu",
    successCode: "Mã yêu cầu:",
    successNote: "Mình sẽ liên hệ lại sớm nhất.",
    again: "Gửi yêu cầu khác",
    nameReq: "Vui lòng nhập họ và tên.",
    phoneReq: "Vui lòng nhập số điện thoại",
    phoneInvalid: "Số điện thoại không hợp lệ (8–15 chữ số).",
    consentReq: "Vui lòng đồng ý chia sẻ thông tin",
    needReq: "Vui lòng mô tả nhu cầu chi tiết để em tư vấn đúng hơn",
    rateLimit: "Quá nhiều yêu cầu — vui lòng thử lại sau 1 giờ",
    network: "Không kết nối được — thử lại",
    submitError: "Lỗi gửi",
  },
  en: {
    title: "Send consultation request",
    typeLabel: "Request type",
    typeBuy: "Buy",
    typeMaintenance: "Maintenance",
    nameLabel: "Name *",
    namePh: "Your full name",
    phoneLabel: "Phone / Zalo *",
    phonePh: "0905 xxx xxx",
    budgetLabel: "Budget",
    budgetPh: "-- Select budget --",
    budgetUnder5m: "< 5 million VND",
    budget5to10m: "5–10 million VND",
    budget10to20m: "10–20 million VND",
    budget20to50m: "20–50 million VND",
    budgetOver50m: "> 50 million VND",
    lineLabel: "Line of interest",
    linePh: "Ligne 2, Gatsby…",
    channelLabel: "Preferred contact channel",
    channelZalo: "Zalo",
    channelTelegram: "Telegram",
    channelCall: "Phone",
    channelWhatsApp: "WhatsApp",
    needLabel: "Detailed request",
    needPh: "Describe lighter condition, model you are looking for, or detailed questions...",
    uploadLabel: "Upload lighter photos (up to 3 photos, ≤1.5MB each)",
    removeFile: "✕ Remove",
    aiLoading: "🤖 AI is analyzing photos...",
    aiLabel: "🤖 Preliminary AI assessment:",
    aiErr: "AI assessment unavailable — no problem, you can still submit",
    consentText: "I agree to provide information and photos for maintenance support",
    submit: "Send request",
    sending: "Sending...",
    successTitle: "✅ Request received",
    successCode: "Request code:",
    successNote: "We will contact you soon.",
    again: "Send another request",
    nameReq: "Please enter your full name.",
    phoneReq: "Please enter your phone number",
    phoneInvalid: "Invalid phone number (8–15 digits).",
    consentReq: "Please agree to share information",
    needReq: "Please describe your request so we can advise you better",
    rateLimit: "Too many requests — please try again in 1 hour",
    network: "Cannot connect — please try again",
    submitError: "Failed to send request",
  },
} as const;

const toBase64 = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(f);
  });

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
  channel: "Zalo",
};

export default function LeadForm() {
  const pathname = usePathname();
  const lang: "vi" | "en" = pathname?.startsWith("/en") ? "en" : "vi";
  const t = T[lang];

  const [form, setForm] = useState<FormData>(initialForm);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [consent, setConsent] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [requestCode, setRequestCode] = useState<string>("");
  const startedRef = useRef(false);

  const analyzeFirstImage = async (file: File) => {
    setAiLoading(true);
    setAiError("");
    try {
      const b64 = await toBase64(file);
      const res = await fetch(VISION_URL, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: "Bearer " + ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_b64: b64,
          mode: "intake",
        }),
      });
      const d = await res.json();
      if (res.ok && d.ok && d.summary) {
        setAiSummary(d.summary);
      } else {
        setAiError(t.aiErr);
      }
    } catch {
      setAiError(t.aiErr);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!startedRef.current) {
      startedRef.current = true;
      track("start_form", { type: form.type });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validImages = selectedFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= 1.5 * 1024 * 1024
    );
    const newAttachments = [...attachments, ...validImages].slice(0, 3);
    setAttachments(newAttachments);
    e.target.value = "";

    if (form.type === "maintenance" && newAttachments.length > 0 && !aiSummary && !aiLoading) {
      analyzeFirstImage(newAttachments[0]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const nextAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(nextAttachments);
    if (nextAttachments.length === 0) {
      setAiSummary("");
      setAiError("");
    }
  };

  const handleReset = () => {
    startedRef.current = false;
    setForm(initialForm);
    setAttachments([]);
    setConsent(false);
    setAiSummary("");
    setAiLoading(false);
    setAiError("");
    setStatus("idle");
    setErrorMsg("");
    setRequestCode("");
  };

  const chatFieldLabel: Record<"vi" | "en", Record<string, string>> = {
    vi: { need: "nhu cầu chi tiết", line: "dòng quan tâm", photo: "vài tấm ảnh bật lửa" },
    en: { need: "request details", line: "preferred line", photo: "a few photos of the lighter" },
  };

  // Sau khi gửi THÀNH CÔNG nhưng thiếu thông tin phụ → mở chat widget nhắc bổ sung nhẹ nhàng
  const dispatchChatPrompt = (missing: string[], requestCode: string) => {
    const labels = missing.map((k) => chatFieldLabel[lang][k] || k).join(", ");
    const text =
      lang === "vi"
        ? `Dạ em đã nhận yêu cầu của anh (mã #${requestCode}). Anh cho em biết thêm ${labels} để em tư vấn chuẩn hơn nha — gõ ngay ở đây cũng được ạ.`
        : `I've received your request (code #${requestCode}). Could you tell me more: ${labels}? Just type here and I'll help right away.`;
    window.dispatchEvent(new CustomEvent("sang-chat-prompt", { detail: { text, requestCode } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName) {
      setStatus("error");
      setErrorMsg(t.nameReq);
      return;
    }

    if (!trimmedPhone) {
      setStatus("error");
      setErrorMsg(t.phoneReq);
      return;
    }

    if (!/^[0-9+\s-]{8,15}$/.test(trimmedPhone)) {
      setStatus("error");
      setErrorMsg(t.phoneInvalid);
      return;
    }

    if (form.type === "maintenance" && !consent) {
      setStatus("error");
      setErrorMsg(t.consentReq);
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      let b64List: string[] = [];
      if (form.type === "maintenance" && attachments.length > 0) {
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
          channel: form.channel || "Zalo",
          ...(form.type === "maintenance"
            ? {
                ai_summary: aiSummary || undefined,
                ...(attachments.length > 0
                  ? {
                      attachments: attachments.map((f, i) => ({
                        name: f.name,
                        base64: b64List[i],
                      })),
                    }
                  : {}),
              }
            : {}),
        }),
      });

      const d = await res.json();
      track("submit_form", {
        type: form.type,
        request_code: d.request_code || "",
        status:
          res.ok && d.ok
            ? "ok"
            : res.status === 429
            ? "rate_limited"
            : "error",
      });

      if (res.ok && d.ok) {
        setRequestCode(d.request_code || "");
        setStatus("success");
        setAttachments([]);
        setConsent(false);
        setAiSummary("");
        setAiLoading(false);
        setAiError("");
        // Thiếu thông tin phụ → vẫn gửi OK, mở widget nhắc bổ sung nhẹ nhàng (không chặn)
        const missing: string[] = [];
        if (!form.need.trim()) missing.push("need");
        if (!form.line_interest.trim()) missing.push("line");
        if (form.type === "maintenance" && attachments.length === 0) missing.push("photo");
        if (missing.length > 0 && d.request_code) {
          window.setTimeout(() => dispatchChatPrompt(missing, d.request_code), 600);
        }
      } else if (res.status === 429) {
        setStatus("error");
        setErrorMsg(t.rateLimit);
      } else {
        setStatus("error");
        setErrorMsg(d.error || t.submitError);
      }
    } catch {
      track("submit_form", { type: form.type, status: "network_error" });
      setStatus("error");
      setErrorMsg(t.network);
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
        {t.title}
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
            {t.successTitle}
          </p>
          <p style={{ color: "#f3ecd9", margin: "0 0 8px", fontSize: "0.95rem" }}>
            {t.successCode} <b>#{requestCode}</b>
          </p>
          <p style={{ color: "#a89f8a", margin: "0 0 20px", fontSize: "0.9rem" }}>
            {t.successNote}
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
            {t.again}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
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
                {t.typeLabel}
              </label>
              <select
                id="lead-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="buy">{t.typeBuy}</option>
                <option value="maintenance">{t.typeMaintenance}</option>
              </select>
            </div>

            <div>
              <label htmlFor="lead-name" style={labelStyle}>
                {t.nameLabel}
              </label>
              <input
                id="lead-name"
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder={t.namePh}
                style={inputStyle}
              />
            </div>

            {/* Row 2: Phone + Budget */}
            <div>
              <label htmlFor="lead-phone" style={labelStyle}>
                {t.phoneLabel}
              </label>
              <input
                id="lead-phone"
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder={t.phonePh}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="lead-budget" style={labelStyle}>
                {t.budgetLabel}
              </label>
              <select
                id="lead-budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">{t.budgetPh}</option>
                <option value="< 5 triệu">{t.budgetUnder5m}</option>
                <option value="5–10 triệu">{t.budget5to10m}</option>
                <option value="10–20 triệu">{t.budget10to20m}</option>
                <option value="20–50 triệu">{t.budget20to50m}</option>
                <option value="> 50 triệu">{t.budgetOver50m}</option>
              </select>
            </div>

            {/* Row 3: Line of interest + Channel */}
            <div>
              <label htmlFor="lead-line-interest" style={labelStyle}>
                {t.lineLabel}
              </label>
              <input
                id="lead-line-interest"
                type="text"
                name="line_interest"
                value={form.line_interest}
                onChange={handleChange}
                placeholder={t.linePh}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="lead-channel" style={labelStyle}>
                {t.channelLabel}
              </label>
              <select
                id="lead-channel"
                name="channel"
                value={form.channel}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Zalo">{t.channelZalo}</option>
                <option value="Call">{t.channelCall}</option>
                <option value="Telegram">{t.channelTelegram}</option>
                <option value="WhatsApp">{t.channelWhatsApp}</option>
              </select>
            </div>
          </div>

          {/* Full width: Need */}
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="lead-need" style={labelStyle}>
              {t.needLabel}
            </label>
            <textarea
              id="lead-need"
              name="need"
              rows={3}
              value={form.need}
              onChange={handleChange}
              placeholder={t.needPh}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {form.type === "maintenance" && (
            <>
              {/* Attachments */}
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="lead-attachments" style={labelStyle}>
                  {t.uploadLabel}
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
                          {t.removeFile}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {aiLoading && (
                  <p
                    style={{
                      color: "#d4af37",
                      fontSize: "0.8rem",
                      margin: "8px 0 0",
                      fontStyle: "italic",
                    }}
                  >
                    {t.aiLoading}
                  </p>
                )}

                {aiSummary && (
                  <div
                    style={{
                      marginTop: "8px",
                      background: "#0a0a0d",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      borderRadius: "6px",
                      padding: "8px",
                      fontSize: "0.8rem",
                      color: "#f3ecd9",
                      lineHeight: "1.4",
                    }}
                  >
                    {t.aiLabel} {aiSummary}
                  </div>
                )}

                {aiError && !aiSummary && !aiLoading && (
                  <p
                    style={{
                      color: "#a89f8a",
                      fontSize: "0.8rem",
                      margin: "8px 0 0",
                    }}
                  >
                    {aiError}
                  </p>
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
                  {t.consentText}
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
            {status === "sending" ? t.sending : t.submit}
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

"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

const FUNC_URL = "https://iloaeaoojxdovedjtowt.supabase.co/functions/v1/ai-chat";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(FUNC_URL, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: "Bearer " + ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: msg }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: d.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: d.error || "Tạm thời không liên hệ được — thử lại" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Tạm thời không liên hệ được — thử lại" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút nổi */}
      <button
        type="button"
        aria-label={open ? "Đóng chat" : "Mở chat AI"}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#d4af37",
          color: "#0a0a0d",
          fontSize: 24,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,.4)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Panel chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 84,
            right: 20,
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            height: 480,
            background: "#101014",
            border: "1px solid rgba(212,175,55,.3)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 999,
            boxShadow: "0 12px 40px rgba(0,0,0,.6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(212,175,55,.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#d4af37",
                fontFamily: "serif",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              Trợ lý SangDupont
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a
                href="https://t.me/sangdupontbot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.8rem",
                  color: "#a89f8a",
                  textDecoration: "none",
                }}
              >
                Chat người thật →
              </a>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng chat"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a89f8a",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#0a0a0d",
                  border: "1px solid rgba(212,175,55,.25)",
                  color: "#f3ecd9",
                  padding: "8px 12px",
                  borderRadius: "10px 10px 10px 2px",
                  maxWidth: "85%",
                  fontSize: "0.85rem",
                  lineHeight: 1.55,
                }}
              >
                Chào anh/chị, em là trợ lý AI của SangDupont, anh/chị cần em tư vấn về mẫu bật lửa Duponts nào?
              </div>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={
                  m.role === "user"
                    ? {
                        alignSelf: "flex-end",
                        background: "#d4af37",
                        color: "#0a0a0d",
                        padding: "8px 12px",
                        borderRadius: "10px 10px 2px 10px",
                        maxWidth: "85%",
                        fontSize: "0.85rem",
                        whiteSpace: "pre-wrap",
                      }
                    : {
                        alignSelf: "flex-start",
                        background: "#0a0a0d",
                        border: "1px solid rgba(212,175,55,.25)",
                        color: "#f3ecd9",
                        padding: "8px 12px",
                        borderRadius: "10px 10px 10px 2px",
                        maxWidth: "85%",
                        fontSize: "0.85rem",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }
                }
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#0a0a0d",
                  border: "1px solid rgba(212,175,55,.25)",
                  color: "#a89f8a",
                  padding: "8px 12px",
                  borderRadius: "10px 10px 10px 2px",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}
              >
                Đang phản hồi...
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            style={{
              borderTop: "1px solid rgba(212,175,55,.2)",
              padding: "10px 12px",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1,
                background: "#0a0a0d",
                color: "#f3ecd9",
                border: "1px solid rgba(212,175,55,.25)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: "#d4af37",
                color: "#0a0a0d",
                border: "none",
                borderRadius: 6,
                padding: "0 14px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Gửi
            </button>
          </form>

          {/* Disclaimer */}
          <div
            style={{
              fontSize: "0.65rem",
              color: "#6f6857",
              textAlign: "center",
              padding: "4px 10px 8px",
            }}
          >
            Trợ lý AI trả lời dựa trên dữ liệu sản phẩm — thông tin cuối cùng do người thật xác nhận
          </div>
        </div>
      )}
    </>
  );
}

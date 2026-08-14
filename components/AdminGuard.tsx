"use client";

import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = ["tvccbod@gmail.com", "aivntps@gmail.com"];

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        setStatus("ok");
      } else {
        setStatus("denied");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        setStatus("ok");
      } else {
        setStatus("denied");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0d",
          color: "#f3ecd9",
          fontFamily: "sans-serif",
        }}
      >
        Đang kiểm tra…
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0d",
          padding: "24px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            background: "#101014",
            border: "1px solid rgba(212,175,55,.3)",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              display: "grid",
              placeItems: "center",
              color: "#ef4444",
              fontSize: "24px",
            }}
          >
            ✕
          </div>
          <h2
            style={{
              color: "#d4af37",
              fontSize: "20px",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            Không có quyền truy cập
          </h2>
          <p
            style={{
              color: "#f3ecd9",
              fontSize: "14px",
              opacity: 0.8,
              marginBottom: "24px",
              lineHeight: 1.5,
            }}
          >
            Trang này chỉ dành riêng cho quản trị viên. Vui lòng đăng nhập với tài khoản có thẩm quyền.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#d4af37",
              color: "#0a0a0d",
              fontWeight: "bold",
              padding: "10px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

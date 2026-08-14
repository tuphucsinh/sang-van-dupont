"use client";

import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

const ADMIN_EMAILS = ["tvccbod@gmail.com", "aivntps@gmail.com"];

export default function AdminLoginPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [checking, setChecking] = useState<boolean>(true);
  const [email, setEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!checking && email && ADMIN_EMAILS.includes(email)) {
      router.replace("/admin/products");
    }
  }, [checking, email, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/admin",
      },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPass || loginLoading) return;
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPass,
    });
    setLoginLoading(false);
    if (error) {
      setLoginError(
        error.message.includes("Invalid login")
          ? "Email hoặc mật khẩu không đúng"
          : error.message
      );
    }
    // thành công → onAuthStateChange tự cập nhật email → redirect
  };

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0d",
          color: "#d4af37",
          fontFamily: "sans-serif",
        }}
      >
        <div>Đang kiểm tra…</div>
      </div>
    );
  }

  if (email && ADMIN_EMAILS.includes(email)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0d",
          color: "#d4af37",
          fontFamily: "sans-serif",
        }}
      >
        <div>Đang chuyển hướng...</div>
      </div>
    );
  }

  if (email && !ADMIN_EMAILS.includes(email)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0d",
          padding: "20px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            background: "#101014",
            border: "1px solid rgba(220, 38, 38, 0.4)",
            borderRadius: "12px",
            padding: isMobile ? "24px" : "40px",
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
          <h1
            style={{
              color: "#ef4444",
              fontSize: "20px",
              marginBottom: "12px",
              fontWeight: 600,
            }}
          >
            Tài khoản không có quyền admin
          </h1>
          <p
            style={{
              color: "#f3ecd9",
              fontSize: "14px",
              opacity: 0.8,
              marginBottom: "8px",
            }}
          >
            Đã đăng nhập: <strong style={{ color: "#fff" }}>{email}</strong>
          </p>
          <p
            style={{
              color: "#f3ecd9",
              fontSize: "13px",
              opacity: 0.6,
              marginBottom: "24px",
            }}
          >
            Tài khoản này không nằm trong danh sách quản trị viên.
          </p>
          <button
            onClick={handleSignOut}
            style={{
              background: "#ef4444",
              color: "#ffffff",
              fontWeight: "bold",
              padding: "12px 24px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontSize: "14px",
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0d",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "#101014",
          border: "1px solid rgba(212,175,55,.25)",
          borderRadius: "12px",
          padding: isMobile ? "24px" : "40px",
          maxWidth: "400px",
          width: "100%",
          margin: "auto",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <img
          src="/assets/img/logo-final_64.png"
          width={48}
          height={48}
          alt="SangDupont Logo"
          style={{
            margin: "0 auto 16px",
            display: "block",
          }}
        />
        <h1
          style={{
            fontFamily: "Cinzel, serif",
            color: "#d4af37",
            fontSize: "24px",
            marginBottom: "8px",
            letterSpacing: "0.05em",
          }}
        >
          SangDupont Admin
        </h1>
        <p
          style={{
            color: "#f3ecd9",
            fontSize: "14px",
            opacity: 0.85,
            marginBottom: "28px",
            lineHeight: 1.5,
          }}
        >
          Đăng nhập bằng GitHub để quản lý sản phẩm và lead
        </p>
        <button
          onClick={handleGitHubLogin}
          style={{
            background: "#d4af37",
            color: "#0a0a0d",
            fontWeight: "bold",
            padding: "12px 24px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(212,175,55,0.2)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ display: "inline-block" }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          Đăng nhập với GitHub
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0 16px",
            color: "#666",
            fontSize: "12px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(212,175,55,.15)" }} />
          hoặc
          <div style={{ flex: 1, height: "1px", background: "rgba(212,175,55,.15)" }} />
        </div>
        <form onSubmit={handleEmailLogin} style={{ textAlign: "left" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "#a89f8a",
              marginBottom: "6px",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="username"
            style={{
              width: "100%",
              background: "#0a0a0d",
              color: "#f3ecd9",
              border: "1px solid rgba(212,175,55,.25)",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "14px",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "#a89f8a",
              marginBottom: "6px",
            }}
          >
            Mật khẩu
          </label>
          <input
            type="password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: "100%",
              background: "#0a0a0d",
              color: "#f3ecd9",
              border: "1px solid rgba(212,175,55,.25)",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "14px",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />
          {loginError && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loginLoading || !loginEmail.trim() || !loginPass}
            style={{
              background: "#0a0a0d",
              color: "#d4af37",
              border: "1px solid rgba(212,175,55,.45)",
              fontWeight: "bold",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
              fontSize: "14px",
              opacity: loginLoading || !loginEmail.trim() || !loginPass ? 0.5 : 1,
            }}
          >
            {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <p
          style={{
            color: "#888",
            fontSize: "12px",
            marginTop: "16px",
            marginBottom: 0,
          }}
        >
          Chỉ admin được phép truy cập
        </p>
      </div>
    </div>
  );
}

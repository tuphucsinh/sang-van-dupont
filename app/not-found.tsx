import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Không tìm thấy trang | SangDupont",
  description: "Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển hướng.",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0a0a0d)",
        color: "var(--ink, #f3ecd9)",
        textAlign: "center",
        padding: "60px 20px",
      }}
    >
      <div className="container" style={{ maxWidth: "640px" }}>
        <div className="eyebrow">404 · NOT FOUND</div>
        <h1
          className="sec-title"
          style={{
            color: "var(--gold, #d4af37)",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            marginTop: "12px",
            marginBottom: "16px",
          }}
        >
          Không tìm thấy trang
        </h1>
        <div className="ornament">
          <span className="dia"></span>
        </div>
        <p
          className="sec-sub"
          style={{
            margin: "24px auto 36px",
            color: "var(--ink-dim, #a89f8a)",
            fontSize: "1rem",
            lineHeight: "1.6",
          }}
        >
          Trang bạn tìm kiếm không tồn tại hoặc đã được thay đổi. Vui lòng quay
          lại trang chủ để tiếp tục khám phá bộ sưu tập bật lửa S.T. Dupont vintage.
        </p>
        <div>
          <Link href="/vi" className="btn solid">
            VỀ TRANG CHỦ
          </Link>
        </div>
      </div>
    </main>
  );
}

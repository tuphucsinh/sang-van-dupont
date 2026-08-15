"use client";

import Link from "next/link";
import type { Product } from "../lib/catalog";

export default function Collection({
  products,
  lang = "vi",
}: {
  products: Product[];
  lang?: "vi" | "en";
}) {
  return (
    <section className="section" id="collection">
      <div className="container">
        <div className="eyebrow reveal" data-i18n="col_eyebrow">
          Collection 2026
        </div>
        <h2 className="sec-title reveal" data-i18n="col_title">
          Tinh hoa trong từng chi tiết
        </h2>
        <div className="ornament reveal">
          <span className="dia"></span>
        </div>
        <p className="sec-sub reveal" data-i18n="col_sub">
          Mỗi chiếc bật lửa là một lát cắt lịch sử — sơn mài Trung Hoa, khắc guilloché, mạ vàng 20 microns. Mỗi sản phẩm đều được kiểm tra và bảo dưỡng trước khi đến tay người sưu tầm.
        </p>
        <div className="gallery">
          {products.map((p, i) => {
            const delayClass = i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : "";
            const cardClass = `card reveal${delayClass}`;

            return (
              <Link key={p.id} href={`/${lang}/products/${p.slug}`} className={cardClass}>
                <img src={p.media[0]?.url} alt={p.name_vi} loading="lazy" decoding="async" />
                {p.status !== "available" && (
                  <span
                    className="badge"
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      zIndex: 3,
                      background: "var(--gold)",
                      color: "#0a0a0d",
                      padding: "4px 10px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {p.status === "reserved" ? "Đã giữ" : "Đã bán"}
                  </span>
                )}
                <div className="cap">
                  <b>{p.name_vi}</b>
                  <span>{p.line || p.condition || ""}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="collection-cta reveal d2">
          <p>
            {lang === "vi"
              ? "AI thế hệ mới nhất sẽ tư vấn và giúp bạn tìm chiếc bật lửa phù hợp nhất với phong cách của bạn."
              : "Our latest AI assistant will help you find the lighter that best fits your style."}
          </p>
          <button
            type="button"
            className="btn solid"
            onClick={() => window.dispatchEvent(new CustomEvent("sang-open-chat"))}
          >
            {lang === "vi" ? "CHAT TƯ VẤN" : "CHAT WITH AI"}
          </button>
        </div>
      </div>
    </section>
  );
}

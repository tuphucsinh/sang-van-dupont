import Link from "next/link";
import type { Product } from "../lib/catalog";

export default function Collection({ products }: { products: Product[] }) {
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
            const tallClass = i === 4 ? " tall" : "";
            const cardClass = `card reveal${delayClass}${tallClass}`;

            return (
              <Link key={p.id} href={`/vi/products/${p.slug}`} className={cardClass}>
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
      </div>
    </section>
  );
}

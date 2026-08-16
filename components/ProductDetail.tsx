"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "../lib/catalog";

interface ProductDetailProps {
  product: Product;
  lang: "vi" | "en";
  similar: Product[];
}

export default function ProductDetail({
  product,
  lang,
  similar,
}: ProductDetailProps) {
  const [hoverHome, setHoverHome] = useState(false);
  const [hoverProducts, setHoverProducts] = useState(false);
  const t =
    lang === "en"
      ? {
          home: "Home",
          products: "Products",
          contact: "Contact",
          reserved: "Reserved",
          sold: "Sold",
          available: "Available",
          similar: "Similar pieces",
          call: "Call",
          chat: "Chat",
          inquiry: "Ask about this piece",
          gallery: "Gallery",
          noImage: "No image available",
        }
      : {
          home: "Trang chủ",
          products: "Sản phẩm",
          contact: "Liên hệ",
          reserved: "Đã giữ",
          sold: "Đã bán",
          available: "Có sẵn",
          similar: "Sản phẩm tương tự",
          call: "Gọi ngay",
          chat: "Chat tư vấn",
          inquiry: "Hỏi về sản phẩm này",
          gallery: "Bộ sưu tập ảnh",
          noImage: "Chưa có hình ảnh",
        };

  const name = lang === "en" ? product.name_en : product.name_vi;
  const desc = lang === "en" ? product.desc_en : product.desc_vi;
  const specs = [product.line, product.material, product.condition]
    .filter(Boolean)
    .join(" • ");
  const formattedPrice =
    product.price != null
      ? `${product.price.toLocaleString("vi-VN")} ₫`
      : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0d",
        color: "#f3ecd9",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "120px 24px 80px",
        }}
      >
        {/* Language switcher */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              borderRadius: "6px",
              overflow: "hidden",
              fontSize: "0.75rem",
            }}
          >
            {lang === "vi" ? (
              <>
                <span
                  style={{
                    padding: "5px 12px",
                    background: "#d4af37",
                    color: "#0a0a0d",
                    fontWeight: 700,
                  }}
                >
                  VI
                </span>
                <Link
                  href={`/en/products/${product.slug}`}
                  style={{
                    padding: "5px 12px",
                    color: "#a89f8a",
                    textDecoration: "none",
                  }}
                >
                  EN
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/vi/products/${product.slug}`}
                  style={{
                    padding: "5px 12px",
                    color: "#a89f8a",
                    textDecoration: "none",
                  }}
                >
                  VI
                </Link>
                <span
                  style={{
                    padding: "5px 12px",
                    background: "#d4af37",
                    color: "#0a0a0d",
                    fontWeight: 700,
                  }}
                >
                  EN
                </span>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "40px",
          }}
        >
          <Link
            href={`/${lang === "en" ? "en" : ""}`}
            onMouseEnter={() => setHoverHome(true)}
            onMouseLeave={() => setHoverHome(false)}
            style={{
              fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
              fontSize: "0.78rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: hoverHome ? "#d4af37" : "#a89f8a",
              textDecoration: "none",
              transition: "color .2s",
            }}
          >
            {t.home}
          </Link>
          <span
            style={{
              color: "#6f6857",
              fontSize: "0.9rem",
              opacity: 0.6,
              margin: "0 2px",
            }}
          >
            ›
          </span>
          <Link
            href={`/${lang === "en" ? "en" : ""}#collection`}
            onMouseEnter={() => setHoverProducts(true)}
            onMouseLeave={() => setHoverProducts(false)}
            style={{
              fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
              fontSize: "0.78rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: hoverProducts ? "#d4af37" : "#a89f8a",
              textDecoration: "none",
              transition: "color .2s",
            }}
          >
            {t.products}
          </Link>
          <span
            style={{
              color: "#6f6857",
              fontSize: "0.9rem",
              opacity: 0.6,
              margin: "0 2px",
            }}
          >
            ›
          </span>
          <span
            style={{
              color: "#d4af37",
              fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              fontWeight: 600,
              maxWidth: "min(60vw, 420px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
        </nav>

        {/* Product Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "start",
            marginBottom: "64px",
          }}
        >
          {/* Cover Image */}
          <div
            style={{
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(212, 175, 55, 0.18)",
              background: "#101014",
            }}
          >
            {product.media[0]?.url ? (
              <img
                src={product.media[0].url}
                alt={name}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89f8a",
                }}
              >
                {t.noImage}
              </div>
            )}
            {product.status !== "available" && (
              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "var(--gold, #d4af37)",
                  color: "#0a0a0d",
                  padding: "6px 14px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  borderRadius: "4px",
                }}
              >
                {product.status === "reserved" ? t.reserved : t.sold}
              </span>
            )}
          </div>

          {/* Product Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
                color: "var(--gold, #d4af37)",
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {name}
            </h1>

            {specs && (
              <div
                style={{
                  color: "#a89f8a",
                  fontSize: "0.95rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {specs}
              </div>
            )}

            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--gold-bright, #f3d77a)",
              }}
            >
              {formattedPrice ? (
                <span>{formattedPrice}</span>
              ) : (
                <span
                  style={{
                    color: "var(--gold, #d4af37)",
                    fontWeight: 700,
                  }}
                >
                  {t.contact}
                </span>
              )}
            </div>

            {desc && (
              <div
                style={{
                  color: "#f3ecd9",
                  lineHeight: 1.8,
                  fontSize: "1rem",
                  whiteSpace: "pre-line",
                  borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                  paddingTop: "20px",
                }}
              >
                {desc}
              </div>
            )}

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <a
                href={`https://zalo.me/84905076886?text=${encodeURIComponent(
                  name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn solid"
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                {t.inquiry}
              </a>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <a
                  href="tel:+84905076886"
                  className="btn"
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.call}
                </a>
                <button
                  type="button"
                  className="btn"
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("sang-open-chat"))
                  }
                >
                  {t.chat}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {product.media && product.media.length > 1 && (
          <div style={{ marginBottom: "64px" }}>
            <h2
              style={{
                fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
                fontSize: "1.5rem",
                color: "var(--gold, #d4af37)",
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              {t.gallery}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              {product.media.slice(1).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid rgba(212, 175, 55, 0.12)",
                    background: "#101014",
                    aspectRatio: "4/3",
                  }}
                >
                  <img
                    src={m.url}
                    alt={`${name} - ${idx + 2}`}
                    loading="lazy"
                    decoding="async"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("sang-open-lightbox", {
                          detail: { src: m.url, caption: name },
                        })
                      )
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similar && similar.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(212, 175, 55, 0.15)",
              paddingTop: "48px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
                fontSize: "1.6rem",
                color: "var(--gold, #d4af37)",
                marginBottom: "24px",
                fontWeight: 600,
              }}
            >
              {t.similar}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "24px",
              }}
            >
              {similar.map((sim) => {
                const simName = lang === "en" ? sim.name_en : sim.name_vi;
                return (
                  <Link
                    key={sim.id}
                    href={`/${lang}/products/${sim.slug}`}
                    style={{
                      display: "block",
                      background: "#101014",
                      border: "1px solid rgba(212, 175, 55, 0.18)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "transform 0.3s, border-color 0.3s",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        background: "#0a0a0d",
                      }}
                    >
                      <img
                        src={sim.media[0]?.url}
                        alt={simName}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                    <div style={{ padding: "16px" }}>
                      <div
                        style={{
                          color: "#f3ecd9",
                          fontWeight: 600,
                          fontSize: "1rem",
                          marginBottom: "6px",
                        }}
                      >
                        {simName}
                      </div>
                      <div
                        style={{
                          color: "var(--gold, #d4af37)",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        {sim.price != null
                          ? `${sim.price.toLocaleString("vi-VN")} ₫`
                          : t.contact}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name,
            description: desc || undefined,
            image: product.media[0]?.url || undefined,
            sku: product.slug,
            ...(product.price
              ? {
                  offers: {
                    "@type": "Offer",
                    price: product.price,
                    priceCurrency: "VND",
                  },
                }
              : {}),
          }),
        }}
      />
    </main>
  );
}

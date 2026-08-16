"use client";

import React, { useState } from "react";
import { useI18n, I18N } from "./I18nProvider";

export default function Hero() {
  const { lang } = useI18n();
  const t = I18N[lang];
  const [videoDone, setVideoDone] = useState(false);
  const [reducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  return (
    <section className="hero">
      <div className="hero-bg">
        {/* hero video (production, đã duyệt giữ 16-08) — autoplay muted, tắt khi prefers-reduced-motion */}
        {!reducedMotion && (
          <video
            autoPlay
            muted
            playsInline
            onEnded={() => setVideoDone(true)}
            poster="/assets/img/hero-veo-poster.jpg"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1, filter: "brightness(.68) contrast(1.12) saturate(1.08)" }}
          >
            <source src="/assets/video/hero-veo.mp4" type="video/mp4" />
          </video>
        )}
        {/* Lớp dim khi video dừng — tối + mờ nhẹ, fade mượt */}
        {!reducedMotion && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
              background: "rgba(10,10,13,.4)",
              backdropFilter: "blur(2px)",
              opacity: videoDone ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          />
        )}
        <picture>
          <source media="(max-width: 768px)" srcSet="/assets/img/hero-mobile.jpg" />
          <img
            src="/assets/img/hero.jpg"
            alt="S.T. Dupont vintage lighter"
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="gold-haze"></div>
      <div className="sparks" id="sparks"></div>
      <div className="hero-content">
        <div className="eyebrow reveal">S.T. Dupont · Paris · Vintage Collection</div>
        <h1 className="reveal d1">
          <span data-i18n="hero_title_1">{t.hero_title_1}</span>
          <br />
          <em data-i18n="hero_title_2">{t.hero_title_2}</em>
        </h1>
        <p className="tagline reveal d2" data-i18n="hero_tagline">
          {t.hero_tagline}
        </p>
        <div className="divider reveal d3">
          <span className="d"></span>
        </div>
        <div className="hero-cta reveal d3">
          <a className="btn" href="#collection" data-i18n="cta_collection">
            {t.cta_collection}
          </a>
        </div>
        <div className="hero-stats reveal d4">
          <div className="stat">
            <b>20+</b>
            <span data-i18n="stat_fb">{t.stat_fb}</span>
          </div>
          <div className="stat">
            <b>1.000+</b>
            <span data-i18n="stat_tiktok">{t.stat_tiktok}</span>
          </div>
          <div className="stat">
            <b>15+</b>
            <span data-i18n="stat_views">{t.stat_views}</span>
          </div>
          <div className="stat">
            <b>100%</b>
            <span data-i18n="stat_videos">{t.stat_videos}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

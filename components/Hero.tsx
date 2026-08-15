"use client";

import React, { useState } from "react";

export default function Hero() {
  const [videoDone, setVideoDone] = useState(false);

  return (
    <section className="hero">
      <div className="hero-bg">
        {/* Video Veo (thử nghiệm local — không git/deploy) — chạy 1 lần; dừng thì tối/mờ nhẹ */}
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
        {/* Lớp dim khi video dừng — tối + mờ nhẹ, fade mượt */}
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
          <span data-i18n="hero_title_1">DI SẢN</span>
          <br />
          <em data-i18n="hero_title_2">Của Lửa</em>
        </h1>
        <p className="tagline reveal d2" data-i18n="hero_tagline">
          Những chiếc bật lửa S.T. Dupont vintage chính hãng — được săn tìm, bảo dưỡng và trao lại bởi một người thực sự đam mê.
        </p>
        <div className="divider reveal d3">
          <span className="d"></span>
        </div>
        <div className="hero-cta reveal d3">
          <a className="btn" href="#collection" data-i18n="cta_collection">
            Khám phá bộ sưu tập
          </a>
        </div>
        <div className="hero-stats reveal d4">
          <div className="stat">
            <b>20+</b>
            <span data-i18n="stat_fb">Năm sưu tầm</span>
          </div>
          <div className="stat">
            <b>1.000+</b>
            <span data-i18n="stat_tiktok">Bật lửa đã thẩm định</span>
          </div>
          <div className="stat">
            <b>15+</b>
            <span data-i18n="stat_views">Năm bảo dưỡng</span>
          </div>
          <div className="stat">
            <b>100%</b>
            <span data-i18n="stat_videos">Chính hãng kiểm định</span>
          </div>
        </div>
      </div>
    </section>
  );
}

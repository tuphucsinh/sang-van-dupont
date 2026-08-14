import React from "react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
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
      <a
        className="chat-fab"
        href="https://t.me/sangdupontbot"
        target="_blank"
        rel="noopener"
        aria-label="Chat tư vấn"
        title="Chat tư vấn"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.9 1.53 5.45 3.9 7.12-.1 1.05-.45 2.5-1.65 3.63 0 0 2.95-.2 4.7-1.7.95.28 1.95.45 3.05.45 5.52 0 10-4.14 10-9.5S17.52 2 12 2z" />
        </svg>
      </a>
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
          <a className="btn solid" href="tel:+84905076886">
            <span data-i18n="cta_call">GỌI NGAY</span> · +84 905 076 886
          </a>
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

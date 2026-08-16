"use client";

import React from "react";
import { useI18n, I18N } from "./I18nProvider";

export default function About() {
  const { lang } = useI18n();
  const t = I18N[lang];

  return (
    <section
      className="section"
      id="about"
      style={{
        background: "linear-gradient(180deg,var(--bg),var(--bg-2) 40%,var(--bg))",
      }}
    >
      <div className="container">
        <div className="about-grid">
          <div className="about-photo reveal">
            <div className="frame">
              <img src="/assets/img/avatar.jpg" alt="Sang Van" />
            </div>
            <div className="badge">
              <b>20+</b>
              <span data-i18n="badge_fb">{t.badge_fb}</span>
            </div>
          </div>
          <div className="about-copy reveal d1">
            <div className="eyebrow" data-i18n="about_eyebrow">
              {t.about_eyebrow}
            </div>
            <h2 data-i18n="about_title">{t.about_title}</h2>
            <p data-i18n="about_p1">
              {t.about_p1}
            </p>
            <p data-i18n="about_p2">
              {t.about_p2}
            </p>
            <blockquote className="quote" data-i18n="about_quote">
              {t.about_quote}
            </blockquote>
            <div className="about-links">
              <a
                className="btn"
                href="https://www.facebook.com/vansang.kt"
                target="_blank"
                rel="noopener"
              >
                Facebook
              </a>
              <a
                className="btn"
                href="https://www.tiktok.com/@sangdupont"
                target="_blank"
                rel="noopener"
              >
                TikTok
              </a>
              <a
                className="btn solid"
                href="https://zalo.me/84905076886"
                target="_blank"
                rel="noopener"
                data-i18n="about_zalo"
              >
                {t.about_zalo}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

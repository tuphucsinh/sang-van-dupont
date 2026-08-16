"use client";

import React from "react";
import LeadForm from "./LeadForm";
import { useI18n, I18N } from "./I18nProvider";

export default function Contact() {
  const { lang } = useI18n();
  const t = I18N[lang];

  return (
    <section className="section contact" id="contact">
      <div className="container">
        <div className="eyebrow reveal" data-i18n="ct_eyebrow">
          {t.ct_eyebrow}
        </div>
        <h2 className="sec-title reveal" data-i18n="ct_title">
          {t.ct_title}
        </h2>
        <div className="ornament reveal">
          <span className="dia"></span>
        </div>
        <a className="phone reveal d1" href="tel:+84905076886">
          +84 905 076 886
        </a>
        <p className="note reveal d2" data-i18n="ct_note">
          {t.ct_note}
        </p>
        <div className="cta-row reveal d3">
          <a className="btn solid" href="tel:+84905076886">
            📞 <span data-i18n="ct_call">{t.ct_call}</span>
          </a>
          <a
            className="btn solid"
            href="https://zalo.me/84905076886"
            target="_blank"
            rel="noopener"
          >
            Zalo
          </a>
          <a
            className="btn"
            href="https://m.me/vansang.kt"
            target="_blank"
            rel="noopener"
          >
            Messenger
          </a>
          <a
            className="btn"
            href="https://www.tiktok.com/@sangdupont"
            target="_blank"
            rel="noopener"
          >
            TikTok
          </a>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}

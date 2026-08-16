"use client";

import React from "react";
import { useI18n, I18N } from "./I18nProvider";

export default function Footer() {
  const { lang } = useI18n();
  const t = I18N[lang];

  return (
    <footer>
      <div className="container foot">
        <div className="foot-logo">
          <img
            src="/assets/img/logo-final_64.png"
            alt="Sang Van logo"
            width={54}
            height={54}
          />
        </div>
        <div className="fname">
          ST·DUPONT <span>VINTAGE</span> — Sang Van
        </div>
        <p data-i18n="foot_note">
          {t.foot_note}
        </p>
        <div className="social">
          <a
            href="https://www.facebook.com/vansang.kt"
            target="_blank"
            rel="noopener"
          >
            FB
          </a>
          <a
            href="https://www.tiktok.com/@sangdupont"
            target="_blank"
            rel="noopener"
          >
            TK
          </a>
          <a
            href="https://zalo.me/84905076886"
            target="_blank"
            rel="noopener"
          >
            ZL
          </a>
        </div>
        <p>© 2026 · Sang Van Collection</p>
      </div>
    </footer>
  );
}

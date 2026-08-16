"use client";

import React from "react";
import { useI18n, I18N } from "./I18nProvider";

export default function Services() {
  const { lang } = useI18n();
  const t = I18N[lang];
  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="eyebrow reveal" data-i18n="svc_eyebrow">
          {t.svc_eyebrow}
        </div>
        <h2 className="sec-title reveal" data-i18n="svc_title">
          {t.svc_title}
        </h2>
        <div className="ornament reveal">
          <span className="dia"></span>
        </div>
        <div className="svc-grid">
          <div className="svc reveal">
            <div className="num">01</div>
            <div className="hr"></div>
            <h3 data-i18n="svc1_t">{t.svc1_t}</h3>
            <p data-i18n="svc1_p">
              {t.svc1_p}
            </p>
          </div>
          <div className="svc reveal d1">
            <div className="num">02</div>
            <div className="hr"></div>
            <h3 data-i18n="svc2_t">{t.svc2_t}</h3>
            <p data-i18n="svc2_p">
              {t.svc2_p}
            </p>
          </div>
          <div className="svc reveal d2">
            <div className="num">03</div>
            <div className="hr"></div>
            <h3 data-i18n="svc3_t">{t.svc3_t}</h3>
            <p data-i18n="svc3_p">
              {t.svc3_p}
            </p>
          </div>
        </div>
        <div className="sec-cta reveal d2">
          <p>
            {lang === "vi"
              ? "Chuyên gia AI sẽ hỗ trợ bạn đánh giá sơ bộ tình hình và hướng dẫn hướng bảo dưỡng phù hợp."
              : "Our AI expert will help you assess the issue and guide you on the right maintenance approach."}
          </p>
          <button
            type="button"
            className="btn solid"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("sang-chat-prompt", {
                  detail: {
                    text:
                      lang === "vi"
                        ? "Chào anh, anh gặp vấn đề gì với bật lửa ạ?"
                        : "Hello! What issue are you having with your lighter?",
                  },
                })
              )
            }
          >
            {lang === "vi" ? "CHAT BẢO DƯỠNG" : "MAINTENANCE CHAT"}
          </button>
        </div>
      </div>
    </section>
  );
}

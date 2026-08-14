"use client";

import React from "react";
import LeadForm from "./LeadForm";

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <div className="eyebrow reveal" data-i18n="ct_eyebrow">
          Liên hệ
        </div>
        <h2 className="sec-title reveal" data-i18n="ct_title">
          Sở hữu một phần lịch sử
        </h2>
        <div className="ornament reveal">
          <span className="dia"></span>
        </div>
        <a className="phone reveal d1" href="tel:+84905076886">
          +84 905 076 886
        </a>
        <p className="note reveal d2" data-i18n="ct_note">
          Inbox hoặc gọi trực tiếp — mình luôn sẵn sàng tư vấn, gửi ảnh chi tiết và bảo dưỡng tận tay.
        </p>
        <div className="cta-row reveal d3">
          <button
            type="button"
            className="btn solid"
            data-i18n="ct_chat"
            onClick={() => window.dispatchEvent(new CustomEvent("sang-open-chat"))}
          >
            💬 Chat tư vấn
          </button>
          <a className="btn solid" href="tel:+84905076886">
            📞 <span data-i18n="ct_call">Gọi ngay</span>
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

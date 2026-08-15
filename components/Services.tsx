"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Services() {
  const pathname = usePathname();
  const lang: "vi" | "en" = pathname?.startsWith("/en") ? "en" : "vi";
  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="eyebrow reveal" data-i18n="svc_eyebrow">
          Dịch vụ
        </div>
        <h2 className="sec-title reveal" data-i18n="svc_title">
          Hơn cả một bộ sưu tập
        </h2>
        <div className="ornament reveal">
          <span className="dia"></span>
        </div>
        <div className="svc-grid">
          <div className="svc reveal">
            <div className="num">01</div>
            <div className="hr"></div>
            <h3 data-i18n="svc1_t">Sưu tầm &amp; kiểm định</h3>
            <p data-i18n="svc1_p">
              Bật lửa S.T. Dupont vintage chính hãng, kiểm tra kỹ nguồn gốc, dấu khắc và tình trạng trước khi trao tay.
            </p>
          </div>
          <div className="svc reveal d1">
            <div className="num">02</div>
            <div className="hr"></div>
            <h3 data-i18n="svc2_t">Bảo dưỡng chuyên sâu</h3>
            <p data-i18n="svc2_p">
              Vệ sinh, chỉnh cơ chế đánh lửa, thay phụ kiện — giữ cho ngọn lửa luôn bùng cháy đúng nhịp Pháp.
            </p>
          </div>
          <div className="svc reveal d2">
            <div className="num">03</div>
            <div className="hr"></div>
            <h3 data-i18n="svc3_t">Phục hồi sơn mài</h3>
            <p data-i18n="svc3_p">
              Chăm sóc lớp sơn mài Trung Hoa và bề mặt mạ vàng — giữ vẻ đẹp nguyên bản qua thời gian.
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

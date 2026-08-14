import React from "react";

export default function About() {
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
              <span data-i18n="badge_fb">Năm sưu tầm</span>
            </div>
          </div>
          <div className="about-copy reveal d1">
            <div className="eyebrow" data-i18n="about_eyebrow">
              Về tôi
            </div>
            <h2 data-i18n="about_title">Sang Van — người giữ lửa S.T. Dupont</h2>
            <p data-i18n="about_p1">
              Đam mê sưu tầm bật lửa S.T. Dupont chính hãng. Tôi dành thời gian tìm kiếm những chiếc bật lửa vintage còn nguyên giá trị, kiểm tra từng chi tiết, bảo dưỡng cơ chế đánh lửa và trao lại chúng cho những người biết trân trọng.
            </p>
            <p data-i18n="about_p2">
              Từ TP.HCM, qua Facebook và TikTok, tôi chia sẻ hành trình sưu tầm của mình đến cộng đồng yêu bật lửa — và đồng hành cùng họ trong việc bảo dưỡng, phục hồi những tuyệt tác nước Pháp.
            </p>
            <blockquote className="quote" data-i18n="about_quote">
              “Đừng do dự nữa anh em, quyết định thôi. Lăn tăn chỉ chuốc muộn phiền — một khi đã thích, xuống tiền nhích ngay.”
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
                Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

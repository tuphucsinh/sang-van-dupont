import React from "react";

export default function Services() {
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
      </div>
    </section>
  );
}

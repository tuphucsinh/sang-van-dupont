import React from "react";

export default function Collection() {
  return (
    <section className="section" id="collection">
      <div className="container">
        <div className="eyebrow reveal" data-i18n="col_eyebrow">
          Collection 2026
        </div>
        <h2 className="sec-title reveal" data-i18n="col_title">
          Tinh hoa trong từng chi tiết
        </h2>
        <div className="ornament reveal">
          <span className="dia"></span>
        </div>
        <p className="sec-sub reveal" data-i18n="col_sub">
          Mỗi chiếc bật lửa là một lát cắt lịch sử — sơn mài Trung Hoa, khắc guilloché, mạ vàng 20 microns. Mỗi sản phẩm đều được kiểm tra và bảo dưỡng trước khi đến tay người sưu tầm.
        </p>
        <div className="gallery">
          <div className="card reveal">
            <img
              src="/assets/img/img_04.jpg"
              alt="ST Dupont vintage lighter on wooden box"
            />
            <div className="cap">
              <b data-i18n="p1">L2 Diamond Thập niên 80</b>
              <span data-i18n="p1_tag">Mạ vàng 20 microns</span>
            </div>
          </div>
          <div className="card reveal d1">
            <img
              src="/assets/img/img_01.jpg"
              alt="ST Dupont gold guilloche lighter"
            />
            <div className="cap">
              <b data-i18n="p2">Ligne 1 Guilloché</b>
              <span data-i18n="p2_tag">Vàng champagne</span>
            </div>
          </div>
          <div className="card reveal d2">
            <img
              src="/assets/img/img_08.jpg"
              alt="ST Dupont black lacquer lighter"
            />
            <div className="cap">
              <b data-i18n="p3">Sơn mài đen huyền</b>
              <span data-i18n="p3_tag">Viền kim loại sáng</span>
            </div>
          </div>
          <div className="card reveal">
            <img
              src="/assets/img/img_05.jpg"
              alt="ST Dupont green black lighter"
            />
            <div className="cap">
              <b data-i18n="p4">Xanh đen cổ điển</b>
              <span data-i18n="p4_tag">Vintage Collection</span>
            </div>
          </div>
          <div className="card tall reveal d1">
            <img
              src="/assets/img/img_12.jpg"
              alt="Hands holding gold lighter"
            />
            <div className="cap">
              <b data-i18n="p5">Gatsby thập niên 90</b>
              <span data-i18n="p5_tag">Bọc vàng guilloché</span>
            </div>
          </div>
          <div className="card reveal d2">
            <img
              src="/assets/img/img_13.jpg"
              alt="Gold guilloche lighter in navy box"
            />
            <div className="cap">
              <b data-i18n="p6">L2 Diamond · Vàng khía</b>
              <span data-i18n="p6_tag">Hộp kèm phụ kiện</span>
            </div>
          </div>
          <div className="card reveal">
            <img
              src="/assets/img/img_03.jpg"
              alt="Lighter bottom engraving"
            />
            <div className="cap">
              <b data-i18n="p7">Dấu khắc thương hiệu</b>
              <span data-i18n="p7_tag">Paris · Made in France</span>
            </div>
          </div>
          <div className="card reveal d1">
            <img
              src="/assets/img/img_02.jpg"
              alt="Open lighter mechanism"
            />
            <div className="cap">
              <b data-i18n="p8">Cơ chế đánh lửa</b>
              <span data-i18n="p8_tag">Bảo dưỡng tận tay</span>
            </div>
          </div>
          <div className="card reveal d2">
            <img
              src="/assets/img/img_11.jpg"
              alt="Vintage lighter set with accessories"
            />
            <div className="cap">
              <b data-i18n="p9">Bộ sưu tầm đi kèm</b>
              <span data-i18n="p9_tag">Hộp · Bao da · Phụ kiện</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

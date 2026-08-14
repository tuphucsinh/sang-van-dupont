"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "vi" | "en";

export const I18N = {
  vi: {
    nav_brand_sub: "Sang Van · Collection",
    nav_collection: "Bộ sưu tập",
    nav_about: "Về Sang",
    nav_services: "Dịch vụ",
    nav_contact: "Liên hệ",
    hero_title_1: "DI SẢN",
    hero_title_2: "Của Lửa",
    hero_tagline: "Những chiếc bật lửa S.T. Dupont vintage chính hãng — được săn tìm, bảo dưỡng và trao lại bởi một người thực sự đam mê.",
    cta_call: "GỌI NGAY",
    cta_collection: "Khám phá bộ sưu tập",
    stat_fb: "Năm sưu tầm",
    stat_tiktok: "Bật lửa đã thẩm định",
    stat_views: "Năm bảo dưỡng",
    stat_videos: "Chính hãng kiểm định",
    col_eyebrow: "Collection 2026",
    col_title: "Tinh hoa trong từng chi tiết",
    col_sub: "Mỗi chiếc bật lửa là một lát cắt lịch sử — sơn mài Trung Hoa, khắc guilloché, mạ vàng 20 microns. Mỗi sản phẩm đều được kiểm tra và bảo dưỡng trước khi đến tay người sưu tầm.",
    p1: "L2 Diamond Thập niên 80", p1_tag: "Mạ vàng 20 microns",
    p2: "Ligne 1 Guilloché", p2_tag: "Vàng champagne",
    p3: "Sơn mài đen huyền", p3_tag: "Viền kim loại sáng",
    p4: "Xanh đen cổ điển", p4_tag: "Vintage Collection",
    p5: "Gatsby thập niên 90", p5_tag: "Bọc vàng guilloché",
    p6: "L2 Diamond · Vàng khía", p6_tag: "Hộp kèm phụ kiện",
    p7: "Dấu khắc thương hiệu", p7_tag: "Paris · Made in France",
    p8: "Cơ chế đánh lửa", p8_tag: "Bảo dưỡng tận tay",
    p9: "Bộ sưu tầm đi kèm", p9_tag: "Hộp · Bao da · Phụ kiện",
    badge_fb: "Năm sưu tầm",
    about_eyebrow: "Về tôi",
    about_title: "Sang Van — người giữ lửa S.T. Dupont",
    about_p1: "Đam mê sưu tầm bật lửa S.T. Dupont chính hãng. Tôi dành thời gian tìm kiếm những chiếc bật lửa vintage còn nguyên giá trị, kiểm tra từng chi tiết, bảo dưỡng cơ chế đánh lửa và trao lại chúng cho những người biết trân trọng.",
    about_p2: "Từ TP.HCM, qua Facebook và TikTok, tôi chia sẻ hành trình sưu tầm của mình đến cộng đồng yêu bật lửa — và đồng hành cùng họ trong việc bảo dưỡng, phục hồi những tuyệt tác nước Pháp.",
    about_quote: "“Đừng do dự nữa anh em, quyết định thôi. Lăn tăn chỉ chuốc muộn phiền — một khi đã thích, xuống tiền nhích ngay.”",
    about_zalo: "Chat Zalo",
    svc_eyebrow: "Dịch vụ",
    svc_title: "Hơn cả một bộ sưu tập",
    svc1_t: "Sưu tầm & kiểm định", svc1_p: "Bật lửa S.T. Dupont vintage chính hãng, kiểm tra kỹ nguồn gốc, dấu khắc và tình trạng trước khi trao tay.",
    svc2_t: "Bảo dưỡng chuyên sâu", svc2_p: "Vệ sinh, chỉnh cơ chế đánh lửa, thay phụ kiện — giữ cho ngọn lửa luôn bùng cháy đúng nhịp Pháp.",
    svc3_t: "Phục hồi sơn mài", svc3_p: "Chăm sóc lớp sơn mài Trung Hoa và bề mặt mạ vàng — giữ vẻ đẹp nguyên bản qua thời gian.",
    ct_eyebrow: "Liên hệ",
    ct_title: "Sở hữu một phần lịch sử",
    ct_note: "Inbox hoặc gọi trực tiếp — mình luôn sẵn sàng tư vấn, gửi ảnh chi tiết và bảo dưỡng tận tay.",
    ct_call: "Gọi ngay",
    ct_chat: "Chat tư vấn",
    foot_note: "Bật lửa sưu tầm chính hãng · Bảo dưỡng chuyên sâu · TP.HCM, Việt Nam"
  },
  en: {
    nav_brand_sub: "Sang Van · Collection",
    nav_collection: "Collection",
    nav_about: "About Sang",
    nav_services: "Services",
    nav_contact: "Contact",
    hero_title_1: "HEIRLOOM",
    hero_title_2: "Of Fire",
    hero_tagline: "Authentic vintage S.T. Dupont lighters — sourced, restored and passed on by a true enthusiast.",
    cta_call: "CALL NOW",
    cta_collection: "Explore the collection",
    stat_fb: "Years Collecting",
    stat_tiktok: "Lighters Authenticated",
    stat_views: "Years of Service",
    stat_videos: "Authenticity Verified",
    col_eyebrow: "Collection 2026",
    col_title: "Excellence in every detail",
    col_sub: "Each lighter is a slice of history — Chinese lacquer, guilloché engraving, 20-micron gold plating. Every piece is inspected and serviced before it reaches the collector.",
    p1: "L2 Diamond · 1980s", p1_tag: "20-micron gold plate",
    p2: "Ligne 1 Guilloché", p2_tag: "Champagne gold",
    p3: "Black lacquer noir", p3_tag: "Polished metal trim",
    p4: "Classic green-black", p4_tag: "Vintage Collection",
    p5: "Gatsby · 1990s", p5_tag: "Gold guilloché",
    p6: "L2 Diamond · Fluted gold", p6_tag: "Box & accessories",
    p7: "Brand hallmarks", p7_tag: "Paris · Made in France",
    p8: "Ignition mechanism", p8_tag: "Hand-serviced",
    p9: "Collector's set", p9_tag: "Box · Leather · Accessories",
    badge_fb: "Years Collecting",
    about_eyebrow: "About me",
    about_title: "Sang Van — keeper of the S.T. Dupont flame",
    about_p1: "Passionate about authentic S.T. Dupont lighters. I spend my time hunting for vintage pieces that retain their value, inspecting every detail, servicing the ignition mechanism, and passing them to people who truly appreciate them.",
    about_p2: "From Ho Chi Minh City, through Facebook and TikTok, I share my collecting journey with the lighter community — and help them service and restore these French masterpieces.",
    about_quote: "“Don't hesitate anymore, my friends — decide. Hesitation only brings regret; once you love it, go for it.”",
    about_zalo: "Chat on Zalo",
    svc_eyebrow: "Services",
    svc_title: "More than a collection",
    svc1_t: "Curating & authentication", svc1_p: "Authentic vintage S.T. Dupont lighters, carefully checked for provenance, hallmarks and condition.",
    svc2_t: "Deep servicing", svc2_p: "Cleaning, ignition tuning, parts replacement — keeping the flame burning with French precision.",
    svc3_t: "Lacquer restoration", svc3_p: "Caring for Chinese lacquer and gold-plated surfaces — preserving original beauty through time.",
    ct_eyebrow: "Contact",
    ct_title: "Own a piece of history",
    ct_note: "Message or call directly — always happy to advise, send detailed photos and hand-service your lighter.",
    ct_call: "Call now",
    ct_chat: "Chat with us",
    foot_note: "Authentic collector lighters · Expert servicing · Ho Chi Minh City, Vietnam"
  }
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "vi",
  setLang: () => {},
});

export function I18nProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: "vi" | "en";
}) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (initialLang) return initialLang;
    if (typeof window === "undefined") return "vi";
    try {
      const stored = localStorage.getItem("sang_lang");
      return stored === "en" || stored === "vi" ? stored : "vi";
    } catch {
      return "vi";
    }
  });

  const applyLang = useCallback((nextLang: Lang) => {
    document.documentElement.setAttribute("lang", nextLang);
    document.documentElement.dataset.lang = nextLang;
    const dict = I18N[nextLang];
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n as keyof typeof dict | undefined;
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });
    document.getElementById("langVi")?.classList.toggle("active", nextLang === "vi");
    document.getElementById("langEn")?.classList.toggle("active", nextLang === "en");
    try {
      localStorage.setItem("sang_lang", nextLang);
    } catch {}
  }, []);

  const setLang = useCallback(
    (nextLang: Lang) => {
      setLangState(nextLang);
      applyLang(nextLang);
    },
    [applyLang]
  );

  useEffect(() => {
    applyLang(lang);
  }, [lang, applyLang]);

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

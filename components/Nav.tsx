"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

export default function Nav() {
  const { lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setOpen(false);
  };

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <nav id="nav" className={scrolled ? "scrolled" : ""}>
      <div className="brand">
        <img
          className="mark"
          src="/assets/img/logo-final_64.png"
          alt="Sang Van logo"
          width={48}
          height={48}
        />
        <div className="name">
          ST·DUPONT <small data-i18n="nav_brand_sub">Sang Van · Collection</small>
        </div>
      </div>
      <div className={`nav-links${open ? " open" : ""}`} id="navLinks">
        <a href="#collection" data-i18n="nav_collection" onClick={closeMenu}>
          Bộ sưu tập
        </a>
        <a href="#about" data-i18n="nav_about" onClick={closeMenu}>
          Về Sang
        </a>
        <a href="#services" data-i18n="nav_services" onClick={closeMenu}>
          Dịch vụ
        </a>
        <a href="#contact" data-i18n="nav_contact" onClick={closeMenu}>
          Liên hệ
        </a>
        <div className="lang-toggle">
          <button
            id="langVi"
            className={lang === "vi" ? "active" : ""}
            onClick={() => setLang("vi")}
            type="button"
          >
            VI
          </button>
          <button
            id="langEn"
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
            type="button"
          >
            EN
          </button>
        </div>
      </div>
      <button
        className="burger"
        id="burger"
        aria-label="Menu"
        onClick={toggleMenu}
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}

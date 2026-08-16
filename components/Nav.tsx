"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, I18N } from "./I18nProvider";

export default function Nav() {
  const { lang } = useI18n();
  const t = I18N[lang];
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
          ST·DUPONT <small data-i18n="nav_brand_sub">{t.nav_brand_sub}</small>
        </div>
      </div>
      <div className={`nav-links${open ? " open" : ""}`} id="navLinks">
        <a href="#collection" data-i18n="nav_collection" onClick={closeMenu}>
          {t.nav_collection}
        </a>
        <a href="#about" data-i18n="nav_about" onClick={closeMenu}>
          {t.nav_about}
        </a>
        <a href="#services" data-i18n="nav_services" onClick={closeMenu}>
          {t.nav_services}
        </a>
        <a href="#contact" data-i18n="nav_contact" onClick={closeMenu}>
          {t.nav_contact}
        </a>
        <div className="lang-toggle">
          <Link
            id="langVi"
            href="/vi"
            className={lang === "vi" ? "active" : ""}
            style={{
              display: "inline-block",
              padding: "8px 14px",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              background: lang === "vi" ? "var(--gold)" : "transparent",
              color: lang === "vi" ? "#0a0a0d" : "var(--ink-dim)",
              fontWeight: lang === "vi" ? 600 : 400,
              textDecoration: "none",
              transition: "all .3s",
            }}
          >
            VI
          </Link>
          <Link
            id="langEn"
            href="/en"
            className={lang === "en" ? "active" : ""}
            style={{
              display: "inline-block",
              padding: "8px 14px",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              background: lang === "en" ? "var(--gold)" : "transparent",
              color: lang === "en" ? "#0a0a0d" : "var(--ink-dim)",
              fontWeight: lang === "en" ? 600 : 400,
              textDecoration: "none",
              transition: "all .3s",
            }}
          >
            EN
          </Link>
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

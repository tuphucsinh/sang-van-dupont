"use client";

import { useEffect } from "react";
import { useI18n } from "./I18nProvider";

export default function RevealClient() {
  const { lang } = useI18n();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, [lang]);

  return null;
}

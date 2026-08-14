"use client";

import React, { useEffect, useState, useCallback } from "react";

export default function Lightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [caption, setCaption] = useState("");

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const handleCardClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest(".card");
      if (card) {
        const img = card.querySelector("img") as HTMLImageElement | null;
        const cap = card.querySelector(".cap") as HTMLElement | null;
        if (img) {
          setImgSrc(img.src);
          setCaption(cap ? cap.textContent?.trim().replace(/\s+/g, " · ") || "" : "");
          setIsOpen(true);
          document.body.style.overflow = "hidden";
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("click", handleCardClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleCardClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [close]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  return (
    <div
      className={`lightbox${isOpen ? " open" : ""}`}
      id="lightbox"
      onClick={handleBackdropClick}
    >
      <button
        className="lb-close"
        id="lbClose"
        aria-label="Close"
        onClick={close}
        type="button"
      >
        ✕
      </button>
      <img id="lbImg" src={imgSrc} alt="" />
      <div className="lb-cap" id="lbCap">
        {caption}
      </div>
    </div>
  );
}

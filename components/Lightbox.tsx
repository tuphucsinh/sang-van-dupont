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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ src: string; caption?: string }>;
      if (customEvent.detail?.src) {
        setImgSrc(customEvent.detail.src);
        setCaption(customEvent.detail.caption || "");
        setIsOpen(true);
        document.body.style.overflow = "hidden";
      }
    };

    window.addEventListener("sang-open-lightbox", handleCustomOpen);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("sang-open-lightbox", handleCustomOpen);
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

"use client";

import { useEffect } from "react";

export default function SparksClient() {
  useEffect(() => {
    const box = document.getElementById("sparks");
    if (!box || box.children.length > 0) return;
    for (let i = 0; i < 18; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = 8 + Math.random() * 84 + "%";
      s.style.animationDuration = 7 + Math.random() * 9 + "s";
      s.style.animationDelay = Math.random() * 8 + "s";
      box.appendChild(s);
    }
  }, []);

  return null;
}

"use client";

import React from "react";
import { useI18n, I18N } from "./I18nProvider";

export default function Marquee() {
  const { lang } = useI18n();
  const t = I18N[lang];

  return (
    <div className="marquee">
      <div className="track" id="marqueeTrack">
        <span>
          <i>◆</i> {t.marquee_1} <i>◆</i> {t.marquee_2} <i>◆</i> {t.marquee_3} <i>◆</i> {t.marquee_4} <i>◆</i> {t.marquee_5} <i>◆</i>
        </span>
        <span>
          <i>◆</i> {t.marquee_1} <i>◆</i> {t.marquee_2} <i>◆</i> {t.marquee_3} <i>◆</i> {t.marquee_4} <i>◆</i> {t.marquee_5} <i>◆</i>
        </span>
      </div>
    </div>
  );
}

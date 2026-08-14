"use client";

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.gtag?.("event", event, params);
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function Ga4({ gaId }: { gaId: string }) {
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag("js", new Date()); gtag("config", "${gaId}");`,
        }}
      />
    </>
  );
}

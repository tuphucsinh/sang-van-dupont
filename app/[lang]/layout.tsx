import type { Metadata } from "next";

export function generateStaticParams() {
  return [{ lang: "vi" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";

  if (isEn) {
    return {
      title: "ST DUPONT VINTAGE — Sang Van | Vintage S.T. Dupont Lighters",
      description:
        "Authentic vintage S.T. Dupont lighters — French artistry, curated, inspected and serviced in Vietnam.",
      openGraph: {
        title: "ST DUPONT VINTAGE — Sang Van | Vintage S.T. Dupont Lighters",
        description:
          "Authentic vintage S.T. Dupont lighters — French artistry, curated, inspected and serviced in Vietnam.",
        siteName: "SangDupont",
        locale: "en_US",
        type: "website",
        images: [{ url: "/assets/img/hero.jpg", width: 1200, height: 630 }],
      },
    };
  }

  return {
    title: "ST DUPONT VINTAGE — Sang Van · Bật lửa sưu tầm chính hãng",
    description:
      "Sưu tầm & bảo dưỡng bật lửa S.T. Dupont vintage chính hãng — Tinh hoa nước Pháp, gửi đến Việt Nam.",
    openGraph: {
      title: "ST DUPONT VINTAGE — Sang Van",
      description:
        "Bật lửa S.T. Dupont vintage chính hãng — sưu tầm, kiểm định, bảo dưỡng",
      siteName: "SangDupont",
      locale: "vi_VN",
      type: "website",
      images: [{ url: "/assets/img/hero.jpg", width: 1200, height: 630 }],
    },
  };
}

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

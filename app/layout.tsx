import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sangdupont.vercel.app"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

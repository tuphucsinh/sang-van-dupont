import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ST DUPONT VINTAGE — Sang Van · Bật lửa sưu tầm chính hãng",
  description:
    "Sưu tầm & bảo dưỡng bật lửa S.T. Dupont vintage chính hãng — Tinh hoa nước Pháp, gửi đến Việt Nam.",
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

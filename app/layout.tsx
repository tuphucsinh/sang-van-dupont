import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import Ga4 from "@/components/Ga4";
import AiChat from "@/components/AiChat";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA4_ID || "";

// Font self-host qua next/font (subset vietnamese đầy đủ — fix dấu tiếng Việt vỡ P7T06)
// Giới hạn weight/style để không tụt perf (Cormorant không variable — chỉ lấy italic 400)
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  weight: ["600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif-2",
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sangdupont.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <body>
        {children}
        <AiChat />
        {gaId ? <Ga4 gaId={gaId} /> : null}
      </body>
    </html>
  );
}

import type { MetadataRoute } from "next";

// output:'export' bắt buộc force-static cho route đặc biệt
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: "https://sangdupont.vercel.app/sitemap.xml",
  };
}

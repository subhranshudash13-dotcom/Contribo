import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contribo.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/login/"] },
    ],
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}

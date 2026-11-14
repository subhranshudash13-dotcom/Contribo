import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://contribo.dev").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/programs", "/organizations", "/projects", "/resources", "/guidelines"];
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}

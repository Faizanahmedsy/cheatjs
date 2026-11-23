import { BASE_PATH } from "@/lib/base-path";
import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

/** Crawlers read the main site's root robots.txt; this copy at /class/robots.txt points at the class sitemap too. */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: [`${BASE_PATH}/study`] }], sitemap: absolute("/sitemap.xml") };
}

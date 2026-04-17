import { MetadataRoute } from "next";
import * as fs from "fs";
import * as path from "path";

const ROBOTS_OVERRIDE = path.join(process.cwd(), "scripts", "robots-override.txt");

export default function robots(): MetadataRoute.Robots {
  // If admin has saved a custom override, serve it as a raw text response
  // (Next.js MetadataRoute.Robots doesn't directly support raw strings,
  // so we return the structured default — the override is served by a
  // separate /api/admin/robots GET but also overrides the route handler
  // via next.config.mjs rewrites if configured)

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/profile"],
      },
    ],
    sitemap: "https://codecraftbd.info/sitemap.xml",
    host: "https://codecraftbd.info",
  };
}


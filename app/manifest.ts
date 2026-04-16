import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Code Craft BD — ডিজিটাল এজেন্সি",
    short_name: "Code Craft BD",
    description: "Bangladesh's top digital agency. Custom web, AI automation, SEO & creative media.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ef4444",
    lang: "bn",
    dir: "ltr",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-home.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        // @ts-ignore
        form_factor: "wide",
        label: "Code Craft BD Homepage",
      },
    ],
    shortcuts: [
      {
        name: "Services",
        short_name: "Services",
        description: "View our services",
        url: "/services",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        description: "Get in touch",
        url: "/contact",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}

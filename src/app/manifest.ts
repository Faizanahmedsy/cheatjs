import { BASE_PATH } from "@/lib/base-path";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Billu Class",
    short_name: "Billu Class",
    description: "Cheatsheets, AWS SAA-C03 and Gen AI study notes with flashcards.",
    start_url: `${BASE_PATH}/study`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: `${BASE_PATH}/icons/192`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icons/512`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${BASE_PATH}/icons/512`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

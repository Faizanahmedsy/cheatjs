import { BASE_PATH, PUBLIC_ORIGIN } from "./base-path";
import type { Metadata } from "next";
import { BILLU, SITE_NAME } from "./subjects";

/** The public address: the Billu site forwards /class/* to this project. */
export const SITE_ORIGIN = PUBLIC_ORIGIN;
export const SITE_URL = `${PUBLIC_ORIGIN}${BASE_PATH}`;

export function absolute(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Title, description, canonical, Open Graph and Twitter for one page. */
const OG_IMAGE = { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Billu Class" };

export function pageMeta({ title, description, path, keywords = [] }: { title: string; description: string; path: string; keywords?: string[] }): Metadata {
  const url = absolute(path);
  const fullTitle = title === SITE_NAME ? `${SITE_NAME} · Visual DSA, Gen AI, AWS and JavaScript` : `${title} · ${SITE_NAME}`;
  return {
    title: fullTitle,
    description,
    keywords: [...keywords, "Ustad Billu", "Billu Class", "Ustad Billu ki Class", "Hinglish", "learn coding", "interview preparation"],
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: fullTitle, description, siteName: SITE_NAME, locale: "en_IN", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ustadbillu.vercel.app/#organization",
  name: "Ustad Billu",
  url: "https://ustadbillu.vercel.app",
  logo: `${SITE_URL}/icon.png`,
  description: "Ustad Billu is a faceless tech education channel where a teacher cat explains DSA, interview preparation, generative AI and AWS in simple Hinglish.",
  sameAs: [BILLU.youtube, BILLU.instagram],
  founder: { "@type": "Person", name: "Faizan", url: "https://faizansaiyed.vercel.app" },
};

export const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ["Ustad Billu ki Class", "Billu ki Class", "Cheat JS", "CheatJS"],
  url: SITE_URL,
  inLanguage: "en-IN",
  publisher: { "@id": "https://ustadbillu.vercel.app/#organization" },
  description: "Free visual lessons from Ustad Billu: a step-by-step DSA visualizer with 174 questions, an AWS lab, a Gen AI visual lab and JavaScript cheatsheets.",
};

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

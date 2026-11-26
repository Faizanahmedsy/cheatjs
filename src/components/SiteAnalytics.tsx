import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

/** GA4 Measurement ID ("G-XXXXXXXXXX"). Google Analytics stays off while this is empty. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

/**
 * Visitor counting: Vercel Web Analytics plus (optionally) Google Analytics 4.
 *
 * The class is served at ustadbillu.vercel.app/class through a rewrite, so the
 * Vercel paths are pinned to /_vercel/insights on that domain. The data shows up
 * in the Vercel project that owns the domain (ustadbillu), under /class/...
 */
export function SiteAnalytics() {
  return (
    <>
      <Analytics
        scriptSrc="/_vercel/insights/script.js"
        endpoint="/_vercel/insights"
        viewEndpoint="/_vercel/insights/view"
        eventEndpoint="/_vercel/insights/event"
        sessionEndpoint="/_vercel/insights/session"
      />
      {GA_ID && process.env.NODE_ENV === "production" ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});`}
          </Script>
        </>
      ) : null}
    </>
  );
}

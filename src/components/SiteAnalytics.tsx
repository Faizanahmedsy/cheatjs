import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

/** Google Tag Manager container. Google Analytics is set up inside it, not in this code. */
const GTM_ID = "GTM-PDTN653L";

/**
 * Visitor counting: Vercel Web Analytics plus Google Tag Manager.
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
      {process.env.NODE_ENV === "production" ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              title="Google Tag Manager"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}

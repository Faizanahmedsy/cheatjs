import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { SubjectBar } from "@/components/SubjectBar";
import { MobileCrumbs } from "@/components/MobileCrumbs";
import { ReadingFocusExit } from "@/components/ReadingFocusExit";
import { SiteFooter } from "@/components/SiteFooter";
import { FooterGate } from "@/components/FooterGate";
import { BilluPeek } from "@/components/BilluPeek";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { MODE_SCRIPT } from "@/components/ModeToggle";
import { BASE_PATH } from "@/lib/base-path";
import { JsonLd, ORGANIZATION_LD, SITE_ORIGIN, WEBSITE_LD, pageMeta } from "@/lib/seo";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Billu Class",
    description: "Free visual lessons from Ustad Billu: watch 174 DSA questions run line by line (Pre-DSA to Level 3), break AWS services in the AWS Lab, see how Gen AI works, and revise JavaScript cheatsheets.",
    path: "/",
    keywords: ["DSA visualizer", "learn DSA", "AWS SAA-C03", "Gen AI", "JavaScript cheatsheet"],
  }),
  // Each page sets its own canonical; the layout must not point every page at the home page.
  alternates: undefined,
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: "Billu Class",
  authors: [{ name: "Faizan", url: "https://faizansaiyed.vercel.app" }],
  creator: "Ustad Billu",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Billu Class", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#09090b" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark overflow-x-clip"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased bg-background overflow-x-clip"
        suppressHydrationWarning
      >
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <SubjectBar />
          <MobileCrumbs />
          <div className="flex-grow">{children}</div>
          <FooterGate>
            <SiteFooter />
          </FooterGate>
        </div>
        <JsonLd data={[ORGANIZATION_LD, WEBSITE_LD]} />
        <BilluPeek />
        <KeyboardShortcuts />
        <ReadingFocusExit />
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}

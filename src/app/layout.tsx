import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { SubjectBar } from "@/components/SubjectBar";
import { SiteFooter } from "@/components/SiteFooter";
import { BilluPeek } from "@/components/BilluPeek";
import { MODE_SCRIPT } from "@/components/ModeToggle";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ustad Billu ki Class · Visual DSA, Gen AI, AWS and JS", template: "%s" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Billu ki Class", statusBarStyle: "black-translucent" },
  description:
    "Ustad Billu ki Class (formerly Cheat JS): free visual lessons for DSA, Gen AI, AWS and JavaScript, from Ustad Billu.",
};

export const viewport: Viewport = { themeColor: "#0e0f0f" };

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
          <div className="flex-grow">{children}</div>
          <SiteFooter />
        </div>
        <BilluPeek />
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}

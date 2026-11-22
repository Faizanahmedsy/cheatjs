import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cheat JS",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Cheat JS", statusBarStyle: "black-translucent" },
  description:
    "The easiest to understand resource to learn frontend development on planet earth.",
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark overflow-x-hidden"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
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
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@700&display=swap"
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
        className="font-body antialiased bg-background overflow-x-hidden"
        suppressHydrationWarning
      >
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow">{children}</div>
        </div>
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}

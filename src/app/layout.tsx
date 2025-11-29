import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import "./globals.css";
import { PrototypeBanner } from "@/components/PrototypeBanner";

export const metadata: Metadata = {
  title: "Cheat JS",
  description:
    "The easiest to understand resource to learn frontend development on planet earth.",
};

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
          <PrototypeBanner />
          <Navbar />
          <div className="flex-grow">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

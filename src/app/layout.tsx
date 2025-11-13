import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Code Cheatsheets',
  description: 'Your quick reference for Next.js, React, and advanced frontend concepts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{colorScheme: 'dark'}} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-slate-900" suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

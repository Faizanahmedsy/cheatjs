"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Download, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDownloadModal } from "./PDFDownloadModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Cheatsheets" },
  { href: "/features", label: "Features" },
  { href: "/dsa", label: "Data Structures and Algorithms" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-sm px-4 md:px-8 lg:px-32">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-cyan-400" />
              <span className="font-bold text-lg text-slate-200 font-headline">
                Cheat JS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "transition-colors hover:text-cyan-300",
                    pathname === href
                      ? "text-cyan-400 font-medium"
                      : "text-slate-400"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Button - Icon only on mobile */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-slate-400 hover:text-slate-200"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] bg-slate-900 border-slate-800"
              >
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                        pathname === href
                          ? "bg-slate-800 text-cyan-400"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* PDF Download Modal */}
      <PDFDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ChevronDown, Code2, Download, Menu, Search } from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { cn } from "@/lib/utils";
import { PDFDownloadModal } from "./PDFDownloadModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Cheatsheets" },
  { href: "/features", label: "Features" },
  { href: "/dsa", label: "DSA" },
  { href: "/ai-engineering/visual-lab", label: "Visual Lab" },
  { href: "/gen-ai", label: "Gen AI" },
  { href: "/aws-saa-v2", label: "AWS SAA v2" },
  { href: "/visualizer", label: "JS Visualizer" },
  { href: "/study", label: "Study" },
  { href: "/flashcards", label: "Flashcards" },
];

/** Older sections, kept for reference. Gen AI and AWS SAA v2 replace them in the main bar. */
const archivedLinks = [
  { href: "/ai-engineering", label: "AI Engineering (old)" },
  { href: "/aws-saa", label: "AWS SAA (old)" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) && !(e.target as HTMLElement)?.isContentEditable) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-sm px-3 sm:px-4 lg:px-6 2xl:px-16">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-cyan-400" />
              <span className="font-bold text-lg text-slate-200 font-headline whitespace-nowrap">
                Cheat JS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-3 text-[13px] whitespace-nowrap">
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "flex items-center gap-1 transition-colors hover:text-cyan-300 focus-visible:outline-none",
                    archivedLinks.some((l) => pathname.startsWith(l.href) && !pathname.startsWith("/ai-engineering/visual-lab"))
                      ? "text-cyan-400 font-medium"
                      : "text-slate-400"
                  )}
                >
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                  Archived
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 border-slate-700 bg-slate-900 text-slate-200">
                  <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-slate-500">
                    Old versions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  {archivedLinks.map(({ href, label }) => (
                    <DropdownMenuItem key={href} asChild className="cursor-pointer focus:bg-slate-800 focus:text-cyan-300">
                      <Link href={href}>{label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Ctrl+K)"
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              <Search size={16} />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden rounded border border-slate-600 px-1 text-[10px] lg:inline">Ctrl K</kbd>
            </button>
            {/* Download Button - Icon only on mobile */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg text-sm"
            >
              <Download size={16} />
              <span className="hidden md:inline">Download PDF</span>
            </button>

            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden text-slate-400 hover:text-slate-200"
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
                  <p className="mt-2 flex items-center gap-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archived (old)
                  </p>
                  {archivedLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                        pathname === href
                          ? "bg-slate-800 text-cyan-400"
                          : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-200"
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

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* PDF Download Modal */}
      <PDFDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

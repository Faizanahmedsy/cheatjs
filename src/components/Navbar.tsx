"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Archive, BarChart3, ChevronDown, Download, Menu, Search, Youtube } from "lucide-react";
import { ARCHIVED, BILLU, SITE_NAME, SUBJECTS, findSubject } from "@/lib/subjects";
import { SearchDialog } from "./SearchDialog";
import { ModeToggle } from "./ModeToggle";
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

const archivedLinks = ARCHIVED;

export function Navbar() {
  const pathname = usePathname();
  const [track, setTrack] = useState<string | null>(null);
  useEffect(() => setTrack(new URLSearchParams(window.location.search).get("track")), [pathname]);
  const current = findSubject(pathname, track);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) && !(e.target as HTMLElement)?.isContentEditable) {
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
              <Image src={BILLU.mascot} alt="" width={30} height={30} className="h-8 w-8 rounded-full bg-[#fdf3dc] object-contain p-0.5" priority />
              <span className="flex flex-col leading-none">
                <span className="font-headline text-[15px] font-bold text-slate-100 whitespace-nowrap">{SITE_NAME}</span>
                <span className="hidden whitespace-nowrap text-[10px] text-slate-500 xl:block">by Ustad Billu · formerly Cheat JS</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 text-sm whitespace-nowrap">
              {SUBJECTS.map((subject) => {
                const active = current?.subject.id === subject.id;
                return (
                  <Link
                    key={subject.id}
                    href={subject.tabs[0].href}
                    className={cn(
                      "rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-800 hover:text-slate-100",
                      active ? "bg-slate-800 font-semibold text-cyan-300" : "text-slate-300",
                    )}
                  >
                    <span aria-hidden="true">{subject.emoji} </span>
                    {subject.label}
                  </Link>
                );
              })}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors hover:text-cyan-300 focus-visible:outline-none",
                    archivedLinks.some((l) => pathname === l.href || (pathname.startsWith(l.href + "/") && !pathname.startsWith("/ai-engineering/visual-lab")))
                      ? "text-cyan-400 font-medium"
                      : "text-slate-500"
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
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden whitespace-nowrap rounded border border-slate-600 px-1 text-[10px] 2xl:inline">Ctrl K</kbd>
            </button>
            <ModeToggle />
            {pathname === "/javascript" && (
              <button
                onClick={() => setIsModalOpen(true)}
                aria-label="Download PDF"
                title="Download cheatsheets as PDF"
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:text-slate-100"
              >
                <Download size={16} />
                <span className="hidden 2xl:inline">PDF</span>
              </button>
            )}
            <Link
              href="/study"
              title="My progress, bookmarks and flashcards"
              className={cn(
                "hidden items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:text-slate-100 sm:flex",
                pathname === "/study" ? "text-cyan-300" : "text-slate-400",
              )}
            >
              <BarChart3 size={16} />
              <span className="hidden xl:inline">My progress</span>
            </Link>
            <a
              href={BILLU.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-rose-900/30 hover:brightness-110 md:flex"
            >
              <Youtube size={16} aria-hidden="true" />
              <span className="hidden xl:inline">Ustad Billu</span>
              <span className="sr-only xl:hidden">Ustad Billu on YouTube</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>

            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-slate-400 hover:text-slate-200"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] bg-slate-900 border-slate-800"
              >
                <nav className="flex flex-col gap-2 mt-8 overflow-y-auto">
                  {SUBJECTS.map((subject) => (
                    <div key={subject.id} className="rounded-lg bg-slate-800/40 p-2">
                      <p className="px-2 pb-1 text-sm font-semibold text-slate-200">
                        {subject.emoji} {subject.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {subject.tabs.map((tab) => (
                          <Link
                            key={tab.href}
                            href={tab.href}
                            onClick={() => setIsSheetOpen(false)}
                            className={cn(
                              "rounded-md px-2.5 py-1.5 text-sm",
                              current?.tab.href === tab.href ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300",
                            )}
                          >
                            {tab.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link href="/study" onClick={() => setIsSheetOpen(false)} className="px-4 py-2 text-base text-slate-300">
                    📊 My progress
                  </Link>
                  <a href={BILLU.youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-base text-orange-300">
                    🐱 Ustad Billu on YouTube
                  </a>
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

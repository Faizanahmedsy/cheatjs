"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowDown01Icon, Clock01Icon, Home01Icon, InstagramIcon, Search01Icon, YoutubeIcon } from "hugeicons-react";
import { motion } from "framer-motion";
import { ARCHIVED, BILLU, SITE_NAME, SUBJECTS, findSubject } from "@/lib/subjects";
import { SearchDialog } from "./SearchDialog";
import { MobileBar } from "./MobileBar";
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
      if (e.defaultPrevented) return;
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

  const isActive = (href: string) => pathname === href;
  return (
    <>
      <header data-chrome className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-sm px-3 sm:px-4 lg:px-6 2xl:px-16">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src={BILLU.mascot} alt="" width={24} height={24} className="h-7 w-7 rounded-full bg-[#fdf3dc] object-contain p-0.5" priority />
              <span className="text-[15px] font-semibold text-slate-100 whitespace-nowrap">{SITE_NAME}</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-0.5 text-sm whitespace-nowrap">
              {SUBJECTS.map((subject) => {
                const active = current?.subject.id === subject.id;
                return (
                  <Link
                    key={subject.id}
                    href={subject.tabs[0].href}
                    className={cn(
                      "relative isolate rounded-full px-3.5 py-1.5 transition-colors hover:text-slate-100",
                      active ? "text-slate-50 font-medium" : "text-slate-400",
                    )}
                  >
                    {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-slate-800" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    {subject.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Ctrl+K)"
              className="hidden min-w-[200px] items-center justify-between gap-3 rounded-full bg-slate-800/70 px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 md:flex"
            >
              <span className="flex items-center gap-2"><Search01Icon size={16} /> Search</span>
              <kbd className="hidden whitespace-nowrap text-[10px] text-slate-600 xl:inline">Ctrl K</kbd>
            </button>
            <span className="hidden md:inline"><ModeToggle /></span>
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden rounded-full px-3.5 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none md:block">
                <span className="flex items-center gap-1">More <ArrowDown01Icon size={14} /></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-800 bg-slate-900 p-1.5 text-slate-200 shadow-2xl">
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-800">
                  <Link href="/study" className={cn("gap-2", isActive("/study") && "text-cyan-300")}><Clock01Icon size={16} /> My progress</Link>
                </DropdownMenuItem>
                {pathname === "/javascript" && (
                  <DropdownMenuItem onSelect={() => setIsModalOpen(true)} className="cursor-pointer focus:bg-slate-800">
                    Download PDF
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-800">
                  <a href={BILLU.site} className="gap-2"><Home01Icon size={16} /> Ustad Billu home</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-800">
                  <a href={BILLU.youtube} target="_blank" rel="noopener noreferrer" className="gap-2"><YoutubeIcon size={16} className="text-[#ff3b30]" /> YouTube channel</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-800">
                  <a href={BILLU.instagram} target="_blank" rel="noopener noreferrer" className="gap-2"><InstagramIcon size={16} className="text-[#e1306c]" /> Instagram</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuLabel className="text-[11px] font-normal text-slate-500">Old versions</DropdownMenuLabel>
                {archivedLinks.map(({ href, label }) => (
                  <DropdownMenuItem key={href} asChild className="cursor-pointer text-slate-400 focus:bg-slate-800">
                    <Link href={href}>{label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="hidden text-sm text-slate-400 hover:text-slate-200 md:inline-flex lg:hidden">
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-slate-900 border-slate-800">
                <nav className="mt-8 flex flex-col gap-4 overflow-y-auto">
                  {SUBJECTS.map((subject) => (
                    <div key={subject.id}>
                      <p className="px-2 pb-1 text-xs text-slate-500">{subject.label}</p>
                      {subject.tabs.map((tab) => (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          onClick={() => setIsSheetOpen(false)}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-sm",
                            current?.tab.href === tab.href ? "bg-slate-800 text-slate-50" : "text-slate-300 hover:bg-slate-800/60",
                          )}
                        >
                          {tab.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link href="/study" onClick={() => setIsSheetOpen(false)} className="px-2 text-sm text-slate-300">My progress</Link>
                  <a href={BILLU.site} className="px-2 text-sm text-slate-300">Ustad Billu home</a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <MobileBar
        current={current?.subject ?? null}
        onSearch={() => setSearchOpen(true)}
        onPdf={pathname === "/javascript" ? () => setIsModalOpen(true) : undefined}
      />

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* PDF Download Modal */}
      <PDFDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

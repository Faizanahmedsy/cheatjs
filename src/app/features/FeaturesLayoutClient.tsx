"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { features } from "@/lib/features";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function FeaturesLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const currentTopic = searchParams.get("topic") || "drag-and-drop";
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <ScrollArea className="h-full p-4">
      <nav className="flex flex-col gap-2">
        <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
          Features
        </p>
        {features.map((link) => {
          const Icon = link.icon;
          const isActive = currentTopic === link.id;
          return (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Mobile Sidebar Toggle */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-slate-900/95 border-slate-700/50"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/80">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <ScrollArea className="flex-1 bg-slate-900">
        <main>{children}</main>
      </ScrollArea>
    </div>
  );
}

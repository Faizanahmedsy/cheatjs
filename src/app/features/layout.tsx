'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MousePointer2,
  Lock,
  Sheet,
  Paintbrush,
  Puzzle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarNavLinks = [
  {
    href: '/features',
    label: 'Drag and Drop',
    icon: MousePointer2,
    active: true,
  },
  { href: '#', label: 'Role-based Auth', icon: Lock },
  { href: '#', label: 'Spreadsheet UI', icon: Sheet },
  { href: '#', label: 'Drawing UI', icon: Paintbrush },
  { href: '#', label: 'Other Features', icon: Puzzle },
];

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/80 p-4">
        <nav className="flex flex-col gap-2">
          <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Features
          </p>
          {sidebarNavLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  link.active
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

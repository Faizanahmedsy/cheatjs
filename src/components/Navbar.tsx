'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Cheatsheets' },
  { href: '/features', label: 'Features' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Code2 className="h-6 w-6 text-cyan-400" />
          <span className="font-bold text-lg text-slate-200 font-headline">
            CodeCheats
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'transition-colors hover:text-cyan-300',
                pathname === href ? 'text-cyan-400 font-medium' : 'text-slate-400'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

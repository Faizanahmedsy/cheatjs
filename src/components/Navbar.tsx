'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDownloadModal } from './PDFDownloadModal';

const navLinks = [
  { href: '/', label: 'Cheatsheets' },
  { href: '/features', label: 'Features' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 mr-6">
              <Code2 className="h-6 w-6 text-cyan-400" />
              <span className="font-bold text-lg text-slate-200 font-headline">
                CheatJS
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

          {/* Download Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg text-sm"
          >
            <Download size={16} />
            Download PDF
          </button>
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

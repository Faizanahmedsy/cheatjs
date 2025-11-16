'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { dsaGroups } from '@/lib/dsa';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DSALayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const currentTopic = searchParams.get('topic') || 'visualizations';

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/80">
        <ScrollArea className="h-full p-4">
          <nav className="flex flex-col gap-2">
            {dsaGroups.map((group) => (
              <div key={group.name} className="mb-4">
                <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  {group.name}
                </p>
                {group.topics.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentTopic === link.id;
                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-slate-800 text-cyan-300'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <ScrollArea className="flex-1 bg-slate-900">
        <main>{children}</main>
      </ScrollArea>
    </div>
  );
}

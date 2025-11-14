'use client';

import { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function PrototypeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-yellow-400/80 text-yellow-900 text-sm font-medium overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span>
                This website is currently in a prototype phase and under heavy development.
              </span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-full hover:bg-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-800"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

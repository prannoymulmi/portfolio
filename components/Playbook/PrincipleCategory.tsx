'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlaybookCategory } from '@/lib/types/portfolio';

interface PrincipleCategoryProps {
  category: PlaybookCategory;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PrincipleCategory({
  category,
  isExpanded,
  onToggle,
}: PrincipleCategoryProps) {
  return (
    <div className="chapter-panel overflow-hidden rounded-2xl">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 text-left transition-colors hover:bg-white/25 dark:hover:bg-gray-700/25"
        aria-expanded={isExpanded}
        aria-controls={`principles-${category.name}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold tracking-tight">{category.name}</h3>
          <motion.svg
            className="text-on-photo h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 180 : 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </motion.svg>
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`principles-${category.name}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-400/40"
          >
            <div className="space-y-4 p-5">
              {category.principles.map((principle, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium text-[#f2540d]">{principle.title}</p>
                  <p className="text-on-photo mt-1 text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

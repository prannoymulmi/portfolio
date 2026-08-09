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
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full rounded-t-lg p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-expanded={isExpanded}
        aria-controls={`principles-${category.name}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
          <motion.svg
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
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
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-3 p-4">
              {category.principles.map((principle, idx) => (
                <div key={idx}>
                  <p className="font-medium text-gray-900 dark:text-white">{principle.title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

'use client';

import React from 'react';

interface NavToggleProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
}

export function NavToggle({ isOpen, onChange }: NavToggleProps) {
  return (
    <button
      onClick={() => onChange(!isOpen)}
      className="inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-expanded={isOpen}
      aria-label="Toggle navigation menu"
    >
      <svg
        className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}

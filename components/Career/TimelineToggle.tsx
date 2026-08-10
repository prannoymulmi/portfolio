'use client';

import React, { useEffect, useState } from 'react';

interface TimelineToggleProps {
  isInteractive: boolean;
  onChange: (isInteractive: boolean) => void;
}

export function TimelineToggle({ isInteractive, onChange }: TimelineToggleProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Load preference from localStorage on mount. setState is unavoidable
  // here because we can't read localStorage during SSR without a
  // hydration mismatch.
  useEffect(() => {
    const stored = localStorage.getItem('career-view-mode');
    if (stored !== null) {
      onChange(stored === 'interactive');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, [onChange]);

  const handleToggle = () => {
    const newMode = !isInteractive;
    onChange(newMode);
    // Persist to localStorage
    localStorage.setItem('career-view-mode', newMode ? 'interactive' : 'timeline');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {/* The visible text names the button; this only adds what it does, so the
          accessible name still contains the visible label. */}
      <span className="sr-only">
        Switch to {isInteractive ? 'timeline' : 'interactive'} view:
      </span>
      {isInteractive ? (
        <>
          <span>⚽ Interactive</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">Timeline</span>
        </>
      ) : (
        <>
          <span className="text-gray-500 dark:text-gray-400">Interactive</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
          <span>📋 Timeline</span>
        </>
      )}
    </button>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useUi } from '@/components/Common/LocaleProvider';

interface TimelineToggleProps {
  isInteractive: boolean;
  onChange: (isInteractive: boolean) => void;
}

export function TimelineToggle({ isInteractive, onChange }: TimelineToggleProps) {
  const ui = useUi();
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
    // Same translucent, orange-accented language as the chapter it sits
    // above — an opaque white pill here was the one thing still sitting on top
    // of the photograph rather than in it.
    <button
      onClick={handleToggle}
      className="chapter-panel text-on-photo flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
      aria-label={isInteractive ? ui.career.switchToTimelineView : ui.career.switchToInteractiveView}
    >
      <span className={isInteractive ? 'text-primary' : 'opacity-60'}>{ui.career.pitch}</span>
      <span className="opacity-40">/</span>
      <span className={isInteractive ? 'opacity-60' : 'text-primary'}>{ui.career.timeline}</span>
    </button>
  );
}

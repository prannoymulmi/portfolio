'use client';

import React from 'react';
import { useContent } from '@/components/Common/ContentProvider';

export function SocialLinks() {
  const { social } = useContent();

  if (!social.data?.social || social.data.social.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Social links not available
      </p>
    );
  }

  const socialLinks = social.data.social;

  return (
    <div className="flex flex-wrap gap-4">
      {socialLinks.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-400 dark:hover:bg-gray-700"
          aria-label={`Visit my ${link.network}`}
        >
          <span>{link.network}</span>
        </a>
      ))}
    </div>
  );
}

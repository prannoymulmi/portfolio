'use client';

import React from 'react';
import Link from 'next/link';
import { useContent } from '@/components/Common/ContentProvider';
import { useUi } from '@/components/Common/LocaleProvider';
import { format } from '@/lib/i18n/format';

export function Footer() {
  const { social } = useContent();
  const ui = useUi();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-12 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-display text-lg font-bold text-foreground dark:text-white">
              Prannoy Mulmi
            </p>
            <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">
              {ui.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="label-mono text-xs text-muted-foreground dark:text-gray-400">
              {ui.footer.quickLinks}
            </p>
            <div className="mt-3 space-y-2">
              <div>
                <Link
                  href="/#projects"
                  className="text-sm text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {ui.footer.projects}
                </Link>
              </div>
              <div>
                <Link
                  href="/#skills"
                  className="text-sm text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {ui.footer.selectedWork}
                </Link>
              </div>
              <div>
                <Link
                  href="/#career"
                  className="text-sm text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {ui.footer.career}
                </Link>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p className="label-mono text-xs text-muted-foreground dark:text-gray-400">
              {ui.footer.connect}
            </p>
            <div className="mt-3 space-y-2">
              {social.data?.social?.map((link, idx) => (
                <div key={idx}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    {link.network}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-border pt-8 dark:border-gray-700">
          <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
            {format(ui.footer.copyright, { year: String(currentYear), name: 'Prannoy Mulmi' })}
          </p>
        </div>
      </div>
    </footer>
  );
}

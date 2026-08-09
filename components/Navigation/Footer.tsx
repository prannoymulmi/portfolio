'use client';

import React from 'react';
import Link from 'next/link';
import { useContent } from '@/components/Common/ContentProvider';

export function Footer() {
  const { social } = useContent();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Prannoy Mulmi</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Senior Software Engineer & Cloud Architect
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Quick Links
            </p>
            <div className="mt-3 space-y-2">
              <div>
                <Link
                  href="/projects"
                  className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Projects
                </Link>
              </div>
              <div>
                <Link
                  href="/skills"
                  className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Skills
                </Link>
              </div>
              <div>
                <Link
                  href="/career"
                  className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Career
                </Link>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Connect
            </p>
            <div className="mt-3 space-y-2">
              {social.data?.social?.map((link, idx) => (
                <div key={idx}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    {link.network}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Prannoy Mulmi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

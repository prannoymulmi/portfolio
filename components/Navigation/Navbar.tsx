'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContent } from '@/components/Common/ContentProvider';
import { ThemeToggle } from '@/components/Common/ThemeToggle';
import { NavToggle } from './NavToggle';

export function Navbar() {
  const { navbar } = useContent();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (navbar.loading || !navbar.data) {
    return (
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </nav>
    );
  }

  const navData = navbar.data;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <span className="text-2xl">🚀</span>
            <span className="hidden sm:inline">Prannoy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navData.sections &&
              navData.sections.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  }`}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.title}
                </Link>
              ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <NavToggle
              isOpen={isMobileMenuOpen}
              onChange={setIsMobileMenuOpen}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="space-y-2 border-t border-gray-200 py-4 dark:border-gray-700">
            {navData.sections &&
              navData.sections.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded px-3 py-2 text-sm ${
                    isActive(link.href)
                      ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.title}
                </Link>
              ))}
          </div>
        )}
      </div>
    </nav>
  );
}

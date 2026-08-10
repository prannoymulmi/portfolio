import '@testing-library/jest-dom';
import fs from 'node:fs';
import path from 'node:path';

// Serve JSON content from public/data/ so components that use
// ContentProvider get real content instead of a hanging fetch.
global.fetch = jest.fn(async (input) => {
  const url = typeof input === 'string' ? input : input.url;

  if (url.startsWith('/data/')) {
    const filePath = path.join(process.cwd(), 'public', url);
    try {
      const body = fs.readFileSync(filePath, 'utf-8');
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => JSON.parse(body),
        text: async () => body,
      };
    } catch (err) {
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
        text: async () => String(err),
      };
    }
  }

  throw new Error(`Unmocked fetch: ${url}`);
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

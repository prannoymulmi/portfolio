const nextConfig = require('eslint-config-next/core-web-vitals');

module.exports = [
  {
    ignores: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      'next-env.d.ts',
      // Reference prototype, not this project's code — gitignored, and its
      // Vite/shadcn source does not answer to these rules.
      'showcase',
    ],
  },
  ...nextConfig,
  {
    rules: {
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

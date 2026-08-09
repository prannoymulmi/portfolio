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

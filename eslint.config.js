const nextConfig = require('eslint-config-next');

module.exports = [
  {
    ignores: ['node_modules', '.next', 'dist', 'build'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/display-name': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

import nextConfig from '@/next.config';

describe('legacy page redirects', () => {
  const expected: Record<string, string> = {
    '/skills': '/#skills',
    '/career': '/#career',
    '/education': '/#education',
    '/projects': '/#projects',
    '/playbook': '/#playbook',
    '/about': '/',
    '/contact': '/#contact',
  };

  it('redirects every former standalone page to its matching story anchor', async () => {
    const redirects = await nextConfig.redirects!();

    for (const [source, destination] of Object.entries(expected)) {
      const match = redirects.find((redirect) => redirect.source === source);
      expect(match).toBeDefined();
      expect(match?.destination).toBe(destination);
      expect(match?.permanent).toBe(true);
    }
  });

  it('declares exactly the seven legacy redirects, no more, no less', async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toHaveLength(Object.keys(expected).length);
  });
});

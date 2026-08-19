import { format } from '@/lib/i18n/format';

describe('format', () => {
  it('substitutes a single {name} placeholder', () => {
    expect(format('Hello {name}', { name: 'World' })).toBe('Hello World');
  });

  it('substitutes multiple placeholders', () => {
    expect(
      format('{greeting}, {name}!', { greeting: 'Hi', name: 'Ada' }),
    ).toBe('Hi, Ada!');
  });

  it('leaves a placeholder with no matching var intact rather than throwing', () => {
    expect(format('Hello {name}', {})).toBe('Hello {name}');
  });

  it('returns a template with no placeholders unchanged', () => {
    expect(format('Hello World', { name: 'Ada' })).toBe('Hello World');
  });

  it('handles an empty vars object', () => {
    expect(format('Static text', {})).toBe('Static text');
  });
});

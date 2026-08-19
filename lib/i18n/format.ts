// Pure placeholder substitution for dictionary strings (contracts/ui-dictionary.md
// §Interpolation, ADR 0024). Unknown placeholders are left intact rather than
// thrown on — visibly wrong in dev, not fatal in production (Principle I, no
// clever fallback logic).
export function format(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match,
  );
}

export function safeXmlArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

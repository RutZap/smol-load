/**
 * @param numString Any value to be parsed
 * Tries to parse a value to an int returning null if any kind of error occurs.
 *
 * Various third party services (Recharge, Whistl, etc) use string to represent ints.
 * This is a simple helper to use those strings more safely.
 */
export function parseIntNormalise(numString: unknown): number | null {
  if (typeof numString === 'number') return numString;
  if (typeof numString !== 'string') return null;
  const normalisedString = numString.replace(/,/g, '').trim();
  const value = parseInt(normalisedString);
  return isNaN(value) ? null : value;
}

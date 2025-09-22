/**
 * @param numString Any value to be parsed
 * Tries to parse a value to a float returning null if any kind of error occurs.
 *
 * Various third party services (Recharge, Whistl, etc) use string to represent floats that we need to then do maths on.
 * This is a simple helper to use those strings more safely.
 */
export function parseFloatNormalise(numString: unknown): number | null {
  if (typeof numString === 'number') return numString;
  if (typeof numString !== 'string') return null;
  const normalisedString = numString.replace(/,/g, '').trim();
  const value = parseFloat(normalisedString);
  return isNaN(value) ? null : value;
}

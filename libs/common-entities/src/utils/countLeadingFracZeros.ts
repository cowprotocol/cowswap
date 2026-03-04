/**
 * Returns the number of leading zeros in the fractional part of num/den.
 * For example, 1/1000 = 0.001 has 2 leading zeros.
 * When num >= den the integer part is >= 1 so there are 0 leading zeros.
 */
export function countLeadingFracZeros(num: bigint, den: bigint): number {
  const absNum = num < 0n ? -num : num
  const absDen = den < 0n ? -den : den
  if (absNum === 0n || absDen === 0n || absNum >= absDen) return 0
  // Use string length difference as upper bound to avoid O(n) loop for tiny fractions
  const upperBound = absDen.toString().length - absNum.toString().length + 1
  let count = 0
  let scaled = absNum
  while (count < upperBound && scaled * 10n < absDen) {
    scaled *= 10n
    count++
  }
  return count
}

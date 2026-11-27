/** Parses an API amount in atoms, rejecting anything that is not a positive integer. */
export function positiveIntegerAtom(amount: string): bigint | null {
  if (!/^\d+$/.test(amount)) return null

  const value = BigInt(amount)

  return value > 0n ? value : null
}

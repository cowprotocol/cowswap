// Allow only int or float
// Examples: 5 or 5.4 or 1. or 0.333 or .12
export function getIntOrFloat(amount: string | null): string | null {
  if (!amount) return null

  if (/^\.\d+|\d+\.?\d*$/.test(amount)) return amount

  return null
}

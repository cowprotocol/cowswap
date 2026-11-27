export function getTwapProgress(executedSellAmount: bigint, intendedSellAmount: bigint): number {
  if (intendedSellAmount === 0n) return 0

  const basisPoints = (executedSellAmount * 10_000n) / intendedSellAmount
  return Math.min(Number(basisPoints), 10_000) / 100
}

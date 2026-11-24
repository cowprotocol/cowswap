import type { WaitAndSaveComparisonQuote } from '../state/waitAndSaveComparisonQuoteAtom'

export interface GetWaitAndSaveWaivedFeeParams {
  comparison: WaitAndSaveComparisonQuote | null
  mainBuyAmount: string | undefined
  userQuoteWithWaitAndSave: boolean
}

/**
 * On-quote buy amount minus off-quote buy amount, in buy-token atoms.
 * Missing, stale, or non-positive deltas are omitted.
 */
export function getWaitAndSaveWaivedFeeRawAmount(params: GetWaitAndSaveWaivedFeeParams): bigint | undefined {
  const { comparison, mainBuyAmount, userQuoteWithWaitAndSave } = params

  if (!comparison || !mainBuyAmount || comparison.mainBuyAmount !== mainBuyAmount) return undefined
  if (comparison.enableWaitForCow === userQuoteWithWaitAndSave) return undefined

  const onBuy = parseBuyAmount(userQuoteWithWaitAndSave ? mainBuyAmount : comparison.buyAmount)
  const offBuy = parseBuyAmount(userQuoteWithWaitAndSave ? comparison.buyAmount : mainBuyAmount)
  if (onBuy === undefined || offBuy === undefined) return undefined

  const delta = onBuy - offBuy
  return delta > 0n ? delta : undefined
}

export function parsePositiveBuyAmount(value: string | undefined): bigint | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined

  const amount = BigInt(value)
  return amount > 0n ? amount : undefined
}

function parseBuyAmount(value: string): bigint | undefined {
  if (!/^\d+$/.test(value)) return undefined

  return BigInt(value)
}

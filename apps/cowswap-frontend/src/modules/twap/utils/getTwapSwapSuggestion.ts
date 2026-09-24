import { FEE_SIZE_THRESHOLD } from '@cowprotocol/common-const'

import { DEFAULT_NUM_OF_PARTS } from '../const'

const PERCENT_DENOMINATOR = 100n
const THRESHOLD_PERCENT = BigInt(FEE_SIZE_THRESHOLD)

/**
 * Buy-side amounts for one TWAP part, plus the part count currently selected.
 * Both amounts are raw atoms of the same buy token.
 */
export interface GetTwapSwapSuggestionParams {
  /** Network fee for one part. */
  perPartNetworkBuy: bigint
  /** Buy amount for one part before network costs. */
  perPartBeforeBuy: bigint
  /** Part count selected on the order. Minimum useful count is {@link DEFAULT_NUM_OF_PARTS}. */
  currentParts: number
}

export type TwapSwapSuggestion = { kind: 'reduce-parts'; maxParts: number } | { kind: 'swap-only' }

/**
 * Decides whether a TWAP order should suggest a swap, or a lower part count.
 *
 * The suggestion shows when one part's network cost is at least {@link FEE_SIZE_THRESHOLD}
 * of that part's before-cost buy amount. Gas per part is flat, so the buy-side ratio scales
 * with the part count. `maxParts` is the largest count that stays strictly under the threshold.
 *
 * @param params - Per-part buy amounts and the current part count.
 * @returns A lower part count when one of {@link DEFAULT_NUM_OF_PARTS} or more stays under the
 * threshold, a swap-only suggestion when none does, or `null` when the current order is already under it.
 */
export function getTwapSwapSuggestion({
  perPartNetworkBuy,
  perPartBeforeBuy,
  currentParts,
}: GetTwapSwapSuggestionParams): TwapSwapSuggestion | null {
  if (!Number.isInteger(currentParts) || currentParts < 1) return null
  if (perPartNetworkBuy <= 0n || perPartBeforeBuy <= 0n) return null

  // perPartNetworkBuy / perPartBeforeBuy >= FEE_SIZE_THRESHOLD / 100
  if (perPartNetworkBuy * PERCENT_DENOMINATOR < perPartBeforeBuy * THRESHOLD_PERCENT) return null

  const totalBeforeBuy = perPartBeforeBuy * BigInt(currentParts)
  const scaledTotal = totalBeforeBuy * THRESHOLD_PERCENT
  const scaledNetwork = perPartNetworkBuy * PERCENT_DENOMINATOR
  // Largest n where n * network / totalBefore < threshold. Subtracting 1 drops an exact 10% count.
  const maxParts = scaledTotal > scaledNetwork ? Number((scaledTotal - 1n) / scaledNetwork) : 0

  if (maxParts >= DEFAULT_NUM_OF_PARTS && maxParts < currentParts) {
    return { kind: 'reduce-parts', maxParts }
  }

  return { kind: 'swap-only' }
}

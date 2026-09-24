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
  /**
   * Part count the quote was actually priced for.
   * The stepper can move before a new quote arrives, so this stays on the quoted split.
   * Defaults to {@link currentParts} when the quote already matches the selection.
   */
  quotedParts?: number
}

export type TwapSwapSuggestion = { kind: 'reduce-parts'; maxParts: number } | { kind: 'swap-only' }

/**
 * Decides whether a TWAP order should suggest a swap, or a lower part count.
 *
 * The suggestion shows when the selected part count's network cost is at least {@link FEE_SIZE_THRESHOLD}
 * of that part's before-cost buy amount. Gas per part is flat, so the buy-side ratio scales
 * with the part count of the quote (`quotedParts`), not with a stepper that has already moved.
 * `maxParts` is the largest count that stays strictly under the threshold.
 *
 * @param params - Per-part buy amounts and the current part count.
 * @returns A lower part count when one of {@link DEFAULT_NUM_OF_PARTS} or more stays under the
 * threshold, a swap-only suggestion when none does, or `null` when the current order is already under it.
 */
// eslint-disable-next-line complexity
export function getTwapSwapSuggestion({
  perPartNetworkBuy,
  perPartBeforeBuy,
  currentParts,
  quotedParts = currentParts,
}: GetTwapSwapSuggestionParams): TwapSwapSuggestion | null {
  if (!Number.isInteger(currentParts) || currentParts < 1) return null
  if (!Number.isInteger(quotedParts) || quotedParts < 1) return null
  if (perPartNetworkBuy <= 0n || perPartBeforeBuy <= 0n) return null

  const quoted = BigInt(quotedParts)
  const selected = BigInt(currentParts)

  // Ratio at the selected count: (currentParts / quotedParts) * (network / before) >= threshold.
  if (selected * perPartNetworkBuy * PERCENT_DENOMINATOR < quoted * perPartBeforeBuy * THRESHOLD_PERCENT) return null

  const scaledTotal = perPartBeforeBuy * quoted * THRESHOLD_PERCENT
  const scaledNetwork = perPartNetworkBuy * PERCENT_DENOMINATOR
  // Largest n where n * network / (before * quotedParts) < threshold. Subtracting 1 drops an exact 10% count.
  const maxParts = scaledTotal > scaledNetwork ? Number((scaledTotal - 1n) / scaledNetwork) : 0

  if (maxParts >= DEFAULT_NUM_OF_PARTS && maxParts < currentParts) {
    return { kind: 'reduce-parts', maxParts }
  }

  return { kind: 'swap-only' }
}

export function quotedPartCount(orderSell: bigint, partSell: bigint): number | null {
  if (orderSell <= 0n || partSell <= 0n) return null

  const quotedParts = Number((orderSell + partSell / 2n) / partSell)
  if (!Number.isSafeInteger(quotedParts) || quotedParts < 1) return null

  return quotedParts
}

import { FEE_SIZE_THRESHOLD } from '@cowprotocol/common-const'

import { getTwapSwapSuggestion } from './getTwapSwapSuggestion'

import { DEFAULT_NUM_OF_PARTS } from '../const'

const THRESHOLD_PERCENT = BigInt(FEE_SIZE_THRESHOLD)

function ratioAtParts(
  parts: number,
  perPartNetworkBuy: bigint,
  perPartBeforeBuy: bigint,
  currentParts: number,
): bigint {
  // parts * network * 100 / (before * currentParts), in percent points scaled by the buy amount.
  return (BigInt(parts) * perPartNetworkBuy * 100n) / (perPartBeforeBuy * BigInt(currentParts))
}

describe('getTwapSwapSuggestion', () => {
  it('stays quiet when the part network cost is under the threshold', () => {
    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 50n,
        perPartBeforeBuy: 1_000n,
        currentParts: 10,
      }),
    ).toBeNull()
  })

  it('suggests the largest part count that stays under the threshold', () => {
    // 15% of this part. Six parts would be 9%; seven would be 10.5%.
    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 150n,
        perPartBeforeBuy: 1_000n,
        currentParts: 10,
      }),
    ).toEqual({ kind: 'reduce-parts', maxParts: 6 })
  })

  it('does not suggest a part count that still sits on the threshold', () => {
    // Exactly 10% now. floor(0.10 * total / fee) is 10, which would still show this banner.
    const suggestion = getTwapSwapSuggestion({
      perPartNetworkBuy: 100n,
      perPartBeforeBuy: 1_000n,
      currentParts: 10,
    })

    expect(suggestion).toEqual({ kind: 'reduce-parts', maxParts: 9 })
    expect(ratioAtParts(9, 100n, 1_000n, 10) < THRESHOLD_PERCENT).toBe(true)
    expect(ratioAtParts(10, 100n, 1_000n, 10)).toBe(THRESHOLD_PERCENT)
  })

  it('only suggests a swap when the order is already at the minimum part count', () => {
    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 400n,
        perPartBeforeBuy: 1_000n,
        currentParts: DEFAULT_NUM_OF_PARTS,
      }),
    ).toEqual({ kind: 'swap-only' })
  })

  it('only suggests a swap when no count of 2 or more stays under the threshold', () => {
    // Fully consumed part, four parts. Two parts would still be exactly 50%.
    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 1_000n,
        perPartBeforeBuy: 1_000n,
        currentParts: 4,
      }),
    ).toEqual({ kind: 'swap-only' })
  })

  it('suggests fewer parts for a fully consumed quote when a lower count gets under the threshold', () => {
    // Network fee equals the whole before-cost buy. Two parts land at 6.67%; three land on 10%.
    const suggestion = getTwapSwapSuggestion({
      perPartNetworkBuy: 1_000n,
      perPartBeforeBuy: 1_000n,
      currentParts: 30,
    })

    expect(suggestion).toEqual({ kind: 'reduce-parts', maxParts: 2 })
    expect(ratioAtParts(2, 1_000n, 1_000n, 30) < THRESHOLD_PERCENT).toBe(true)
    expect(ratioAtParts(3, 1_000n, 1_000n, 30)).toBe(THRESHOLD_PERCENT)
  })

  it('ignores a part quote that cannot be compared', () => {
    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 0n,
        perPartBeforeBuy: 1_000n,
        currentParts: 10,
      }),
    ).toBeNull()

    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 100n,
        perPartBeforeBuy: 0n,
        currentParts: 10,
      }),
    ).toBeNull()

    expect(
      getTwapSwapSuggestion({
        perPartNetworkBuy: 100n,
        perPartBeforeBuy: 1_000n,
        currentParts: 1.5,
      }),
    ).toBeNull()
  })
})

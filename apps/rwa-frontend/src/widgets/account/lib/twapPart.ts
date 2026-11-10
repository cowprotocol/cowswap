import { areAddressesEqual, type EnrichedOrder } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

export interface TwapPart {
  /** 1-based */
  number: number
  count: number
}

type PartOrder = Pick<EnrichedOrder, 'owner' | 'sellToken' | 'buyToken' | 'sellAmount' | 'validTo'>

/** Finds the TWAP that generated `order`, by owner, tokens, part amount and expiry */
export function findTwapPart(order: PartOrder, twaps: TwapOrder[]): TwapPart | null {
  for (const { owner, schedule } of twaps) {
    const { sellToken, buyToken, partSellAmount, effectiveStartTime, timeBetweenParts, numberOfParts } = schedule

    if (
      !areAddressesEqual(owner, order.owner) ||
      !areAddressesEqual(sellToken, order.sellToken) ||
      !areAddressesEqual(buyToken, order.buyToken) ||
      partSellAmount !== BigInt(order.sellAmount) ||
      timeBetweenParts <= 0
    ) {
      continue
    }

    // TWAPOrder.sol: part i expires at t0 + (i + 1) * t - 1, or t0 + i * t + span - 1 with span <= t
    const index = Math.floor((order.validTo - effectiveStartTime) / timeBetweenParts)

    if (index >= 0 && index < numberOfParts) return { number: index + 1, count: numberOfParts }
  }

  return null
}

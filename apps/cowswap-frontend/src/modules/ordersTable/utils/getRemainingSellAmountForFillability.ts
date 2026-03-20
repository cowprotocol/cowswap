import { GenericOrder } from 'common/types'

/**
 * For partially executed orders (including TWAP parents), `sellAmount` is still the full order size.
 * Fillability checks must compare wallet balance/allowance to the sell amount still outstanding.
 *
 * TWAP parents emulate the full TWAP `sellAmount` in `emulateTwapAsOrder`; after a part fills,
 * on-chain balance is only what's left for remaining parts — comparing to the full amount falsely
 * flags "Unfillable".
 */
export function getRemainingSellAmountForFillability(order: GenericOrder): bigint {
  const total = BigInt(order.sellAmount)

  if ('executionData' in order && order.executionData) {
    const executed = BigInt(String(order.executionData.executedSellAmount))
    return total > executed ? total - executed : 0n
  }

  if ('apiAdditionalInfo' in order && order.apiAdditionalInfo?.executedSellAmount) {
    const executed = BigInt(order.apiAdditionalInfo.executedSellAmount)
    return total > executed ? total - executed : 0n
  }

  return total
}

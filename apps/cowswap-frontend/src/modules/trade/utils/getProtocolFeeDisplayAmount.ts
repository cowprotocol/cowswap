import { Currency, CurrencyAmount, Fraction } from '@cowprotocol/currency'

import { PROTOCOL_FEE_SCALE } from 'common/constants/common'

import { ReceiveAmountInfo } from '../types'

const ONE_HUNDRED_PERCENT_SCALED = 10_000 * PROTOCOL_FEE_SCALE

/**
 * The SDK floors the protocol fee to whole atoms, so a fee worth less than one atom comes back as 0
 * even though the order is charged a non-zero rate. This recomputes that fee without rounding,
 * so it can be displayed as "< 0.000001" instead of being mistaken for a free order.
 */
export function getProtocolFeeDisplayAmount(
  receiveAmountInfo: ReceiveAmountInfo | null,
): CurrencyAmount<Currency> | undefined {
  const protocolFee = receiveAmountInfo?.costs.protocolFee

  if (!receiveAmountInfo || !protocolFee) return undefined

  const { amount, bps } = protocolFee

  if (!amount.equalTo(0) || bps <= 0) return amount

  const { isSell, afterNetworkCosts } = receiveAmountInfo
  // Same base and formula as the SDK's `getProtocolFeeAmount`, kept as a fraction
  const baseAmount = isSell ? afterNetworkCosts.buyAmount : afterNetworkCosts.sellAmount

  if (!baseAmount.currency.equals(amount.currency)) return amount

  const bpsScaled = Math.round(bps * PROTOCOL_FEE_SCALE)
  const denominator = isSell ? ONE_HUNDRED_PERCENT_SCALED - bpsScaled : ONE_HUNDRED_PERCENT_SCALED + bpsScaled

  return baseAmount.multiply(new Fraction(bpsScaled, denominator))
}

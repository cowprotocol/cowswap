import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { getOrderTypeReceiveAmounts } from './getOrderTypeReceiveAmounts'

import { ReceiveAmountInfo } from '../types'

export function getTotalCosts(
  info: ReceiveAmountInfo,
  additionalCosts?: CurrencyAmount<Currency>,
): CurrencyAmount<Currency> {
  const { networkFeeAmount } = getOrderTypeReceiveAmounts(info)

  let fee = networkFeeAmount.add(info.costs.partnerFee.amount)
  if (info.costs.protocolFee?.amount) {
    fee = fee.add(info.costs.protocolFee.amount)
  }

  if (additionalCosts) {
    if (!additionalCosts.currency.equals(fee.currency)) {
      const additionalCostsFixed = CurrencyAmount.fromRawAmount(
        fee.currency,
        additionalCosts.currency.decimals !== fee.currency.decimals
          ? FractionUtils.adjustDecimalsAtoms(
              additionalCosts,
              fee.currency.decimals,
              additionalCosts.currency.decimals,
            ).quotient.toString()
          : additionalCosts.quotient.toString(),
      )

      return fee.add(additionalCostsFixed)
    }

    return fee.add(additionalCosts)
  }

  return fee
}

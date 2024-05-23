import { bpsToPercent } from '@cowprotocol/common-utils'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from 'modules/trade/types'

export function getReceiveAmountInfo(
  type: ReceiveAmountInfo['type'],
  amount: CurrencyAmount<Currency> | null,
  parnerFee: PartnerFee | undefined
): ReceiveAmountInfo | null {
  const amountsAfterFees = amount && parnerFee ? getAmountAfterFees(type, amount, parnerFee) : null

  if (parnerFee && amount && amountsAfterFees) {
    return {
      type,
      amountBeforeFees: amount,
      ...amountsAfterFees,
      feeAmount: undefined,
      customTitle: type === 'to' ? 'Receive (incl. fees)' : 'From (incl. fees)',
    }
  }

  return null
}

function getAmountAfterFees(type: ReceiveAmountInfo['type'], amount: CurrencyAmount<Currency>, partnerFee: PartnerFee) {
  const partnerFeeAmount = partnerFee ? amount.multiply(bpsToPercent(partnerFee.bps)) : undefined
  const amountAfterFees = partnerFeeAmount
    ? type === 'to'
      ? amount.subtract(partnerFeeAmount)
      : amount.add(partnerFeeAmount)
    : amount

  return {
    amountAfterFees,
    partnerFeeAmount,
  }
}

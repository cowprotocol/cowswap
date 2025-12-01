import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { OrderTypeReceiveAmounts, ReceiveAmountInfo } from '../types'

function calculateAmountAfterFees(
  isSell: boolean,
  afterPartnerFees: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  bridgeFee?: { amountInIntermediateCurrency: CurrencyAmount<Currency> },
): CurrencyAmount<Currency> {
  if (isSell) {
    return bridgeFee
      ? afterPartnerFees.buyAmount.subtract(bridgeFee.amountInIntermediateCurrency)
      : afterPartnerFees.buyAmount
  }
  return afterPartnerFees.sellAmount
}

function getOrderTypeReceiveAmountsWithoutProtocolFee(
  isSell: boolean,
  beforeNetworkCosts: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  afterPartnerFees: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  afterSlippage: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  networkFeeAmount: CurrencyAmount<Currency>,
  bridgeFee?: { amountInIntermediateCurrency: CurrencyAmount<Currency> },
): OrderTypeReceiveAmounts {
  const amountBeforeFees = isSell ? beforeNetworkCosts.buyAmount : beforeNetworkCosts.sellAmount
  const amountAfterFees = calculateAmountAfterFees(isSell, afterPartnerFees, bridgeFee)
  const amountAfterSlippage = isSell ? afterSlippage.buyAmount : afterSlippage.sellAmount

  return {
    amountBeforeFees,
    amountAfterFees,
    amountAfterSlippage,
    networkFeeAmount,
  }
}

function getOrderTypeReceiveAmountsWithProtocolFee(
  isSell: boolean,
  beforeAllFees: ReceiveAmountInfo['beforeAllFees'],
  afterPartnerFees: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  afterSlippage: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  networkFeeAmount: CurrencyAmount<Currency>,
  bridgeFee?: { amountInIntermediateCurrency: CurrencyAmount<Currency> },
): OrderTypeReceiveAmounts {
  const amountAfterFees = calculateAmountAfterFees(isSell, afterPartnerFees, bridgeFee)

  const amountBeforeFees = isSell ? beforeAllFees.buyAmount : beforeAllFees.sellAmount
  const amountAfterSlippage = isSell ? afterSlippage.buyAmount : afterSlippage.sellAmount

  return {
    amountBeforeFees,
    amountAfterFees,
    amountAfterSlippage,
    networkFeeAmount,
  }
}

export function getOrderTypeReceiveAmounts(info: ReceiveAmountInfo): OrderTypeReceiveAmounts {
  const {
    isSell,
    costs: { networkFee, bridgeFee, protocolFee },
    beforeNetworkCosts,
    afterPartnerFees,
    afterSlippage,
    beforeAllFees,
  } = info

  const hasProtocolFee = (protocolFee?.bps ?? 0) > 0
  const networkFeeAmount = isSell ? networkFee.amountInBuyCurrency : networkFee.amountInSellCurrency

  if (!hasProtocolFee || !protocolFee) {
    return getOrderTypeReceiveAmountsWithoutProtocolFee(
      isSell,
      beforeNetworkCosts,
      afterPartnerFees,
      afterSlippage,
      networkFeeAmount,
      bridgeFee,
    )
  }

  return getOrderTypeReceiveAmountsWithProtocolFee(
    isSell,
    beforeAllFees,
    afterPartnerFees,
    afterSlippage,
    networkFeeAmount,
    bridgeFee,
  )
}

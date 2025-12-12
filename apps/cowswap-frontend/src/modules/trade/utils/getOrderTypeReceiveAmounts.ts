import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeFeeAmounts, Currencies, OrderTypeReceiveAmounts, ReceiveAmountInfo } from '../types'

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

function calculateAmountAfterFees(
  isSell: boolean,
  afterPartnerFees: Currencies,
  bridgeFee?: BridgeFeeAmounts,
): CurrencyAmount<Currency> {
  if (isSell) {
    return bridgeFee
      ? afterPartnerFees.buyAmount.subtract(bridgeFee.amountInDestinationCurrency)
      : afterPartnerFees.buyAmount
  }
  return afterPartnerFees.sellAmount
}

function getOrderTypeReceiveAmountsWithoutProtocolFee(
  isSell: boolean,
  beforeNetworkCosts: Currencies,
  afterPartnerFees: Currencies,
  afterSlippage: Currencies,
  networkFeeAmount: CurrencyAmount<Currency>,
  bridgeFee?: BridgeFeeAmounts,
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
  afterPartnerFees: Currencies,
  afterSlippage: Currencies,
  networkFeeAmount: CurrencyAmount<Currency>,
  bridgeFee?: BridgeFeeAmounts,
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

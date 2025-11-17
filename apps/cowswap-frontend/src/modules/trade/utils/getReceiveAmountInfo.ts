import { isSellOrder } from '@cowprotocol/common-utils'
import { getQuoteAmountsAndCosts, type OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

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
  afterPartnerFees: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  afterSlippage: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
  networkFeeAmount: CurrencyAmount<Currency>,
  protocolFee: { amount: CurrencyAmount<Currency> },
  partnerFee: { amount: CurrencyAmount<Currency> },
  bridgeFee?: { amountInIntermediateCurrency: CurrencyAmount<Currency> },
): OrderTypeReceiveAmounts {
  const amountAfterFees = calculateAmountAfterFees(isSell, afterPartnerFees, bridgeFee)
  const protocolFeeAmount = protocolFee.amount
  const partnerFeeAmount = partnerFee.amount

  const amountBeforeFees = amountAfterFees.add(protocolFeeAmount).add(partnerFeeAmount).add(networkFeeAmount)
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
    costs: { networkFee, bridgeFee, protocolFee, partnerFee },
    beforeNetworkCosts,
    afterPartnerFees,
    afterSlippage,
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
    afterPartnerFees,
    afterSlippage,
    networkFeeAmount,
    protocolFee,
    partnerFee,
    bridgeFee,
  )
}

export function getTotalCosts(
  info: ReceiveAmountInfo,
  additionalCosts?: CurrencyAmount<Currency>,
): CurrencyAmount<Currency> {
  const { networkFeeAmount } = getOrderTypeReceiveAmounts(info)
  let fee = networkFeeAmount.add(info.costs.partnerFee.amount)
  if (info.costs.protocolFee?.amount) {
    fee = fee.add(info.costs.protocolFee.amount)
  }

  return additionalCosts ? fee.add(additionalCosts) : fee
}

/**
 * Map native bigint amounts to CurrencyAmounts
 */
export function getReceiveAmountInfo(
  orderParams: OrderParameters,
  inputCurrency: Currency,
  outputCurrency: Currency,
  slippagePercent: Percent,
  _partnerFeeBps: number | undefined,
  intermediateCurrency?: Currency,
  bridgeFeeRaw?: bigint,
  protocolFeeBps?: number,
): ReceiveAmountInfo {
  const partnerFeeBps = _partnerFeeBps ?? 0
  const currenciesExcludingIntermediate = { inputCurrency, outputCurrency }

  const isSell = isSellOrder(orderParams.kind)

  const result = getQuoteAmountsAndCosts({
    orderParams,
    sellDecimals: inputCurrency.decimals,
    buyDecimals: outputCurrency.decimals,
    slippagePercentBps: Number(slippagePercent.numerator),
    partnerFeeBps,
    protocolFeeBps,
  })

  const currenciesWithIntermediate = {
    inputCurrency,
    outputCurrency: intermediateCurrency ?? outputCurrency,
  }
  const beforeNetworkCosts = mapBigIntAmounts(result.beforeNetworkCosts, currenciesWithIntermediate)
  const afterNetworkCosts = mapBigIntAmounts(result.afterNetworkCosts, currenciesWithIntermediate)

  const bridgeFee =
    typeof bridgeFeeRaw === 'bigint' && intermediateCurrency
      ? {
          amountInIntermediateCurrency: CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeFeeRaw.toString()),
          amountInDestinationCurrency: CurrencyAmount.fromRawAmount(outputCurrency, bridgeFeeRaw.toString()),
        }
      : undefined

  return {
    ...result,
    quotePrice: new Price<Currency, Currency>({
      baseAmount: beforeNetworkCosts.sellAmount,
      quoteAmount: afterNetworkCosts.buyAmount,
    }),
    costs: {
      networkFee: {
        amountInSellCurrency: CurrencyAmount.fromRawAmount(
          currenciesWithIntermediate.inputCurrency,
          result.costs.networkFee.amountInSellCurrency.toString(),
        ),
        amountInBuyCurrency: CurrencyAmount.fromRawAmount(
          currenciesWithIntermediate.outputCurrency,
          result.costs.networkFee.amountInBuyCurrency.toString(),
        ),
      },
      partnerFee: {
        amount: CurrencyAmount.fromRawAmount(
          isSell ? currenciesWithIntermediate.outputCurrency : inputCurrency,
          result.costs.partnerFee.amount.toString(),
        ),
        bps: result.costs.partnerFee.bps,
      },
      protocolFee:
        result.costs.protocolFee && result.costs.protocolFee.amount !== 0n
          ? {
              amount: CurrencyAmount.fromRawAmount(
                isSell ? currenciesWithIntermediate.outputCurrency : inputCurrency,
                result.costs.protocolFee.amount.toString(),
              ),
              bps: result.costs.protocolFee.bps,
            }
          : undefined,
      bridgeFee,
    },
    beforeNetworkCosts,
    afterNetworkCosts,
    afterPartnerFees: mapBigIntAmounts(result.afterPartnerFees, currenciesWithIntermediate),
    afterSlippage: mapBigIntAmounts(result.afterSlippage, currenciesExcludingIntermediate),
  }
}

function mapBigIntAmounts(
  amounts: { sellAmount: bigint; buyAmount: bigint },
  currencies: { inputCurrency: Currency; outputCurrency: Currency },
): {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
} {
  return {
    sellAmount: CurrencyAmount.fromRawAmount(currencies.inputCurrency, amounts.sellAmount.toString()),
    buyAmount: CurrencyAmount.fromRawAmount(currencies.outputCurrency, amounts.buyAmount.toString()),
  }
}

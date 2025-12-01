import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'
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

/**
 * Map native bigint amounts to CurrencyAmounts
 */
// eslint-disable-next-line max-lines-per-function, complexity
export function getReceiveAmountInfo(
  orderParams: OrderParameters,
  inputCurrency: Currency,
  outputCurrency: Currency,
  slippagePercent: Percent,
  _partnerFeeBps: number | undefined,
  intermediateCurrency?: Currency,
  bridgeFeeAmounts?: {
    amountInSellCurrency: bigint
    amountInBuyCurrency: bigint
  },
  bridgeBuyAmount?: bigint,
  protocolFeeBps?: number,
): ReceiveAmountInfo {
  const partnerFeeBps = _partnerFeeBps ?? 0
  const currenciesExcludingIntermediate = { inputCurrency, outputCurrency }

  const isSell = isSellOrder(orderParams.kind)

  const buyToken = intermediateCurrency && bridgeBuyAmount ? intermediateCurrency : outputCurrency

  const result = getQuoteAmountsAndCosts({
    orderParams:
      intermediateCurrency && bridgeBuyAmount
        ? {
            ...orderParams,
            buyAmount: FractionUtils.adjustDecimalsAtoms(
              CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeBuyAmount.toString()),
              outputCurrency.decimals,
              intermediateCurrency.decimals,
            ).quotient.toString(),
          }
        : orderParams,
    sellDecimals: inputCurrency.decimals,
    buyDecimals: buyToken.decimals,
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

  const bridgeFee = calculateBridgeFee(outputCurrency, intermediateCurrency, bridgeFeeAmounts)

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
    beforeAllFees: {
      sellAmount: CurrencyAmount.fromRawAmount(
        currenciesWithIntermediate.inputCurrency,
        result.beforeAllFees.sellAmount.toString(),
      ),
      buyAmount: CurrencyAmount.fromRawAmount(
        currenciesWithIntermediate.outputCurrency,
        result.beforeAllFees.buyAmount.toString(),
      ),
    },
    beforeNetworkCosts,
    afterNetworkCosts,
    afterPartnerFees: mapBigIntAmounts(result.afterPartnerFees, currenciesWithIntermediate),
    afterSlippage: mapBigIntAmounts(result.afterSlippage, currenciesExcludingIntermediate),
  }
}

function calculateBridgeFee(
  outputCurrency: Currency,
  intermediateCurrency?: Currency,
  bridgeFeeAmounts?: {
    amountInSellCurrency: bigint
    amountInBuyCurrency: bigint
  },
): ReceiveAmountInfo['costs']['bridgeFee'] | undefined {
  if (!bridgeFeeAmounts || !intermediateCurrency) return undefined

  return {
    amountInIntermediateCurrency: CurrencyAmount.fromRawAmount(
      intermediateCurrency,
      bridgeFeeAmounts.amountInBuyCurrency.toString(),
    ),
    amountInDestinationCurrency: CurrencyAmount.fromRawAmount(
      outputCurrency,
      bridgeFeeAmounts.amountInSellCurrency.toString(),
    ),
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

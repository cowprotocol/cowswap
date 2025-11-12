import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'
import { type OrderParameters, getQuoteAmountsAndCosts } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import { OrderTypeReceiveAmounts, ReceiveAmountInfo } from '../types'

export function getOrderTypeReceiveAmounts(info: ReceiveAmountInfo): OrderTypeReceiveAmounts {
  const {
    isSell,
    costs: { networkFee, bridgeFee },
    afterPartnerFees,
    afterSlippage,
    beforeNetworkCosts,
  } = info

  return {
    amountBeforeFees: isSell ? beforeNetworkCosts.buyAmount : beforeNetworkCosts.sellAmount,
    amountAfterFees: isSell
      ? bridgeFee
        ? afterPartnerFees.buyAmount.subtract(bridgeFee.amountInIntermediateCurrency)
        : afterPartnerFees.buyAmount
      : afterPartnerFees.sellAmount,
    amountAfterSlippage: isSell ? afterSlippage.buyAmount : afterSlippage.sellAmount,
    networkFeeAmount: isSell ? networkFee.amountInBuyCurrency : networkFee.amountInSellCurrency,
  }
}

export function getTotalCosts(
  info: ReceiveAmountInfo,
  additionalCosts?: CurrencyAmount<Currency>,
): CurrencyAmount<Currency> {
  const { networkFeeAmount } = getOrderTypeReceiveAmounts(info)

  const fee = networkFeeAmount.add(info.costs.partnerFee.amount)

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
  bridgeBuyAmount?: bigint,
): ReceiveAmountInfo {
  const partnerFeeBps = _partnerFeeBps ?? 0
  const currenciesExcludingIntermediate = { inputCurrency, outputCurrency }

  const isSell = isSellOrder(orderParams.kind)

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
    buyDecimals: outputCurrency.decimals,
    slippagePercentBps: Number(slippagePercent.numerator),
    partnerFeeBps,
  })

  const currenciesWithIntermediate = {
    inputCurrency,
    outputCurrency: intermediateCurrency ?? outputCurrency,
  }
  const beforeNetworkCosts = mapBigIntAmounts(result.beforeNetworkCosts, currenciesWithIntermediate)
  const afterNetworkCosts = mapBigIntAmounts(result.afterNetworkCosts, currenciesWithIntermediate)

  const bridgeFee = calculateBridgeFee(outputCurrency, intermediateCurrency, bridgeFeeRaw)

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
      bridgeFee,
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
  bridgeFeeRaw?: bigint,
): ReceiveAmountInfo['costs']['bridgeFee'] | undefined {
  if (typeof bridgeFeeRaw !== 'bigint' || !intermediateCurrency) return undefined

  const amountInDestinationCurrency = CurrencyAmount.fromRawAmount(outputCurrency, bridgeFeeRaw.toString())

  if (outputCurrency.decimals !== intermediateCurrency?.decimals) {
    return {
      amountInIntermediateCurrency: FractionUtils.adjustDecimalsAtoms(
        CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeFeeRaw.toString()),
        outputCurrency.decimals,
        intermediateCurrency.decimals,
      ),
      amountInDestinationCurrency,
    }
  }

  return {
    amountInIntermediateCurrency: CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeFeeRaw.toString()),
    amountInDestinationCurrency,
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

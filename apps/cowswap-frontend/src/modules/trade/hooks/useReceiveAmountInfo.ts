import { useMemo } from 'react'

import { bpsToPercent, isSellOrder } from '@cowprotocol/common-utils'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { useWidgetPartnerFee } from 'modules/injectedWidget'
import { useTradeQuote } from 'modules/tradeQuote'

import { useDerivedTradeState } from './useDerivedTradeState'

import { ReceiveAmountInfo } from '../types'

interface ReceiveAmountInfoContext {
  isSell: boolean
  quotePrice: Price<Currency, Currency>
  networkFeeAmount: CurrencyAmount<Currency>
  inputAmountAfterNetworkFees: CurrencyAmount<Currency>
  outputAmountAfterNetworkFees: CurrencyAmount<Currency>
  partnerFee: PartnerFee | undefined
}

export function useReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { state } = useDerivedTradeState()
  const { response: quoteResponse } = useTradeQuote()
  const partnerFee = useWidgetPartnerFee()

  return useMemo(() => {
    if (!state) return null

    const isSell = isSellOrder(state.orderKind)
    const { inputCurrency, outputCurrency } = state

    const quote = quoteResponse?.quote

    if (!inputCurrency || !outputCurrency || !quote) return null

    const networkFeeAmount = CurrencyAmount.fromRawAmount(inputCurrency, quote.feeAmount)

    const inputAmountAfterNetworkFees = CurrencyAmount.fromRawAmount(inputCurrency, quote.sellAmount)
    const outputAmountAfterNetworkFees = CurrencyAmount.fromRawAmount(outputCurrency, quote.buyAmount)

    // Fees exceed amount
    if (networkFeeAmount.greaterThan(inputAmountAfterNetworkFees)) return null

    const quotePrice = new Price<Currency, Currency>({
      baseAmount: inputAmountAfterNetworkFees,
      quoteAmount: outputAmountAfterNetworkFees,
    })

    if (!quotePrice) return null

    return getReceiveAmountInfo({
      isSell,
      quotePrice,
      networkFeeAmount,
      inputAmountAfterNetworkFees,
      outputAmountAfterNetworkFees,
      partnerFee,
    })
  }, [state, partnerFee, quoteResponse])
}

function getReceiveAmountInfo(context: ReceiveAmountInfoContext): ReceiveAmountInfo {
  const {
    isSell,
    quotePrice,
    networkFeeAmount,
    inputAmountAfterNetworkFees,
    outputAmountAfterNetworkFees,
    partnerFee,
  } = context

  const type = isSell ? 'to' : 'from'

  if (isSell) {
    const amountAfterFees = quotePrice.quote(inputAmountAfterNetworkFees.add(networkFeeAmount))

    const partnerFeeAmount = partnerFeeBpsToAmount(partnerFee?.bps, amountAfterFees)

    if (partnerFeeAmount.equalTo(0)) {
      return {
        type,
        amountBeforeFees: amountAfterFees,
        amountAfterFees: quotePrice.quote(inputAmountAfterNetworkFees),
        networkFeeAmount,
        partnerFeeAmount,
      }
    }

    return {
      type,
      amountBeforeFees: amountAfterFees,
      amountAfterFees: outputAmountAfterNetworkFees.subtract(partnerFeeAmount),
      networkFeeAmount,
      partnerFeeAmount,
    }
  } else {
    const amountAfterFees = inputAmountAfterNetworkFees.add(networkFeeAmount)
    const partnerFeeAmount = partnerFeeBpsToAmount(partnerFee?.bps, inputAmountAfterNetworkFees)

    if (partnerFeeAmount.equalTo(0)) {
      return {
        type,
        amountBeforeFees: inputAmountAfterNetworkFees,
        amountAfterFees,
        networkFeeAmount,
        partnerFeeAmount,
      }
    }

    return {
      type,
      amountBeforeFees: inputAmountAfterNetworkFees,
      amountAfterFees: amountAfterFees.add(partnerFeeAmount),
      networkFeeAmount,
      partnerFeeAmount,
    }
  }
}

function partnerFeeBpsToAmount(bps: number | undefined, amount: CurrencyAmount<Currency>): CurrencyAmount<Currency> {
  return bps ? amount.multiply(bpsToPercent(bps)) : CurrencyAmount.fromRawAmount(amount.currency, 0)
}

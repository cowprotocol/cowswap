import { ReactNode } from 'react'

import { COW_TOKEN_TO_CHAIN, V_COW } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'

import { RateInfoParams } from 'common/pure/RateInfo'
import { ActivityDerivedState } from 'common/types/activity'

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
}

export interface OrderSummaryType {
  from: ReactNode | undefined
  to: ReactNode | undefined
  limitPrice: string | undefined
  executionPrice?: string | undefined
  validTo: string | undefined
  fulfillmentTime?: string | undefined
  kind?: string
}

export function computeOrderSummary(
  order: ActivityDerivedState['order'],
  chainId: number
): { orderSummary: OrderSummaryType; rateInfoParams: RateInfoParams; isOrderFulfilled: boolean } {
  let orderSummary: OrderSummaryType
  let rateInfoParams: RateInfoParams = {
    chainId,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    activeRateFiatAmount: null,
    invertedActiveRateFiatAmount: null,
  }
  let isOrderFulfilled = false

  if (order) {
    const {
      inputToken,
      sellAmount,
      feeAmount: feeAmountRaw,
      outputToken,
      buyAmount,
      validTo,
      kind,
      fulfillmentTime,
    } = order

    const inputAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
    const outputAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())
    const feeAmount = CurrencyAmount.fromRawAmount(inputToken, feeAmountRaw.toString())

    isOrderFulfilled = !!order.apiAdditionalInfo && order.status === OrderStatus.FULFILLED

    const { executedSellAmountBeforeFees, executedBuyAmount } = order.apiAdditionalInfo || {}
    const rateInputCurrencyAmount = isOrderFulfilled
      ? CurrencyAmount.fromRawAmount(inputToken, executedSellAmountBeforeFees?.toString() || '0')
      : inputAmount
    const rateOutputCurrencyAmount = isOrderFulfilled
      ? CurrencyAmount.fromRawAmount(outputToken, executedBuyAmount?.toString() || '0')
      : outputAmount

    rateInfoParams = {
      chainId,
      inputCurrencyAmount: rateInputCurrencyAmount,
      outputCurrencyAmount: rateOutputCurrencyAmount,
      activeRateFiatAmount: null,
      invertedActiveRateFiatAmount: null,
    }

    const DateFormatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
    }

    orderSummary = {
      ...DEFAULT_ORDER_SUMMARY,
      from: <TokenAmount amount={inputAmount.add(feeAmount)} tokenSymbol={inputAmount.currency} />,
      to: <TokenAmount amount={outputAmount} tokenSymbol={outputAmount.currency} />,
      validTo: validTo ? new Date((validTo as number) * 1000).toLocaleString(undefined, DateFormatOptions) : undefined,
      fulfillmentTime: fulfillmentTime
        ? new Date(fulfillmentTime).toLocaleString(undefined, DateFormatOptions)
        : undefined,
      kind: kind.toString(),
    }
  } else {
    orderSummary = DEFAULT_ORDER_SUMMARY
  }

  return { orderSummary, rateInfoParams, isOrderFulfilled }
}

export function computeTokens(
  activityDerivedState: ActivityDerivedState,
  enhancedTransaction: ActivityDerivedState['enhancedTransaction'],
  chainId: number
): { inputToken: unknown; outputToken: unknown } {
  let inputToken = activityDerivedState?.order?.inputToken || null
  let outputToken = activityDerivedState?.order?.outputToken || null

  if (enhancedTransaction?.swapVCow || enhancedTransaction?.swapLockedGNOvCow) {
    inputToken = V_COW[chainId as SupportedChainId]
    outputToken = COW_TOKEN_TO_CHAIN[chainId as SupportedChainId]
  }

  return { inputToken, outputToken }
}
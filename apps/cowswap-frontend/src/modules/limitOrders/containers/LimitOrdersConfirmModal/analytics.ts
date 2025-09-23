import { formatTokenAmount, getCurrencyAddress } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

export type ExecutionPriceLike = { toSignificant: (n: number) => string } | null | undefined

export interface LimitOrderEventParams {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  side: 'sell' | 'buy'
  executionPrice?: ExecutionPriceLike
  partialFillsEnabled: boolean
  walletAddress?: string
  chainId?: number
}

export function buildLimitOrderEventLabel(params: {
  inputToken?: Currency
  outputToken?: Currency
  side: 'sell' | 'buy'
  executionPrice?: ExecutionPriceLike
  inputAmount?: CurrencyAmount<Currency> | null
  partialFillsEnabled: boolean
}): string {
  const { inputToken, outputToken, side, executionPrice, inputAmount, partialFillsEnabled } = params
  const inputSymbol = inputToken?.symbol || ''
  const outputSymbol = outputToken?.symbol || ''
  const priceStr = executionPrice ? executionPrice.toSignificant(6) : ''
  const inputAmountHuman = inputAmount ? inputAmount.toSignificant(6) : ''

  return `TokenIn: ${inputSymbol}, TokenOut: ${outputSymbol}, Side: ${side}, Price: ${priceStr}, Amount: ${inputAmountHuman}, PartialFills: ${partialFillsEnabled}`
}

export function buildPlaceLimitOrderEvent(params: LimitOrderEventParams): string {
  const { inputAmount, outputAmount, side, executionPrice, partialFillsEnabled, walletAddress, chainId } = params
  const inputToken = inputAmount.currency
  const outputToken = outputAmount.currency

  const label = buildLimitOrderEventLabel({
    inputToken,
    outputToken,
    side,
    executionPrice,
    inputAmount,
    partialFillsEnabled,
  })

  const sellAmount = formatTokenAmount(inputAmount)
  const buyAmount = formatTokenAmount(outputAmount)

  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.LIMIT_ORDER_SETTINGS,
    action: 'place_limit_order',
    label,
    chainId,
    walletAddress,
    sellToken: getCurrencyAddress(inputToken),
    sellTokenSymbol: inputToken.symbol || '',
    sellTokenChainId: inputToken.chainId ?? chainId,
    sellAmount,
    sellAmountHuman: inputAmount.toSignificant(6),
    buyToken: getCurrencyAddress(outputToken),
    buyTokenSymbol: outputToken.symbol || '',
    buyTokenChainId: outputToken.chainId ?? chainId,
    buyAmountExpected: buyAmount,
    buyAmountHuman: outputAmount.toSignificant(6),
    side,
    ...(executionPrice && { executionPrice: executionPrice.toSignificant(6) }),
  })
}

export function resolveLimitOrderSide(kind: OrderKind): 'sell' | 'buy' {
  return kind === OrderKind.SELL ? 'sell' : 'buy'
}

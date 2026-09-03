import { isEvmChain, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getDefaultCurrencies } from 'common/modules/tradeNavigation'

export interface ExtendedTradeRawState extends TradeRawState {
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly orderKind: OrderKind
}

export interface TradeRawState {
  readonly chainId: number | null
  readonly targetChainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly recipient?: string | null
  readonly recipientAddress?: string | null
}

export function getDefaultTradeRawState(chainId: SupportedChainId | null): TradeRawState {
  const { inputCurrency, outputCurrency } = getDefaultCurrencies(chainId)
  // Currently WETH/wxDAI, less likely to be duplicated, symbol is fine
  // Non-EVM chains are exclusion
  const inputCurrencyId = (!!chainId && isEvmChain(chainId) ? inputCurrency?.symbol : inputCurrency?.address) ?? null

  return {
    chainId,
    targetChainId: null,
    inputCurrencyId,
    outputCurrencyId: outputCurrency?.address || null, // Currently USDC, more likely to be duplicated, better to use address
    recipient: null,
    recipientAddress: null,
  }
}

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { WRAPPED_NATIVE_CURRENCY as WETH } from 'legacy/constants/tokens'

export interface TradeUrlParams {
  readonly chainId: string | undefined
  readonly inputCurrencyId: string | undefined
  readonly outputCurrencyId: string | undefined
}

export interface TradeRawState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly recipient: string | null
}

export interface ExtendedTradeRawState extends TradeRawState {
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly orderKind: OrderKind
}

export type TradeCurrenciesIds = Pick<TradeRawState, 'inputCurrencyId' | 'outputCurrencyId'>

export function getDefaultTradeRawState(chainId: SupportedChainId | null): TradeRawState {
  return {
    chainId,
    inputCurrencyId: chainId ? WETH[chainId]?.symbol || null : null,
    outputCurrencyId: null,
    recipient: null,
  }
}

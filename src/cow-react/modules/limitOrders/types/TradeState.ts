import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'

export interface TradeState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly recipient: string | null
}

export type TradeCurrenciesIds = Pick<TradeState, 'inputCurrencyId' | 'outputCurrencyId'>

export function getDefaultTradeState(chainId: SupportedChainId | null): TradeState {
  return {
    chainId,
    inputCurrencyId: chainId ? WETH[chainId]?.symbol || null : null,
    outputCurrencyId: null,
    recipient: null,
  }
}

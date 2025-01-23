import { TokenWithLogo, USDC, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TradeUrlParams {
  readonly chainId: string | undefined
  readonly inputCurrencyId: string | undefined
  readonly outputCurrencyId: string | undefined
  readonly inputCurrencyAmount: string | undefined
  readonly outputCurrencyAmount: string | undefined
  readonly orderKind: OrderKind | undefined
}

export interface TradeRawState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly recipient?: string | null
  readonly recipientAddress?: string | null
}

export interface ExtendedTradeRawState extends TradeRawState {
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly orderKind: OrderKind
}

export type TradeCurrenciesIds = Pick<TradeRawState, 'inputCurrencyId' | 'outputCurrencyId'>
export type TradeCurrencies = {
  inputCurrency: TokenWithLogo | null
  outputCurrency: TokenWithLogo | null
}

export function getDefaultCurrencies(chainId: SupportedChainId | null): TradeCurrencies {
  return {
    inputCurrency: chainId ? WETH[chainId] || null : null,
    outputCurrency: chainId ? USDC[chainId] || null : null,
  }
}

export function getDefaultTradeRawState(chainId: SupportedChainId | null): TradeRawState {
  const { inputCurrency, outputCurrency } = getDefaultCurrencies(chainId)

  return {
    chainId,
    inputCurrencyId: inputCurrency?.symbol || null,
    outputCurrencyId: outputCurrency?.symbol || null,
    recipient: null,
    recipientAddress: null,
  }
}

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getDefaultTradeCurrenciesIds } from 'common/modules/tradeNavigation'

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
  return {
    chainId,
    ...getDefaultTradeCurrenciesIds(chainId),
    targetChainId: null,
    recipient: null,
    recipientAddress: null,
  }
}

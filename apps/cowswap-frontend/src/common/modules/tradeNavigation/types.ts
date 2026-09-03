import { OrderKind } from '@cowprotocol/cow-sdk'

import { TradeType } from './consts'

import { RoutesValues } from '../../constants/routes'

export type TradeCurrenciesIds = {
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
}

export interface TradeTypeInfo {
  tradeType: TradeType
  route: RoutesValues
}
export interface TradeUrlParams {
  readonly chainId: string | undefined
  readonly inputCurrencyId: string | undefined
  readonly outputCurrencyId: string | undefined
  readonly inputCurrencyAmount: string | undefined
  readonly outputCurrencyAmount: string | undefined
  readonly orderKind: OrderKind | undefined
  readonly targetChainId?: string
}

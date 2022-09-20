import TradeGp from 'state/swap/TradeGp'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

export type ParsedAmounts = {
  INPUT: CurrencyAmount<Currency> | undefined
  OUTPUT: CurrencyAmount<Currency> | undefined
}

export interface FallbackPriceImpactParams {
  abTrade?: TradeGp
  isWrapping: boolean
}

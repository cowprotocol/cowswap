import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

export type Nullish<T> = T | null | undefined

export type FractionLike = Fraction | Price<Currency, Currency> | CurrencyAmount<Currency>

export type ComposableCowInfo = {
  id?: string
  parentId?: string
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

export type BadgeType = 'information' | 'success' | 'alert' | 'alert2' | 'default'

export type CowSwapTheme = 'dark' | 'light'

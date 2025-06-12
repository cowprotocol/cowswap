import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

export type FractionLike = Fraction | Price<Currency, Currency> | CurrencyAmount<Currency>

export type ComposableCowInfo = {
  id?: string
  parentId?: string
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

export const BadgeTypes = {
  INFORMATION: 'information',
  SUCCESS: 'success',
  ALERT: 'alert',
  ALERT2: 'alert2',
  DEFAULT: 'default',
} as const

export type BadgeType = (typeof BadgeTypes)[keyof typeof BadgeTypes]

export type CowSwapTheme = 'dark' | 'light' | 'darkHalloween' | 'lightChristmas' | 'darkChristmas'

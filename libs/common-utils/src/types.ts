import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type Nullish<T> = T | null | undefined

// This is for Pixel tracking injected code
declare global {
  interface Window {
    fbq: any // Facebook (Meta)
    lintrk: any // Linkedin
    twq: any // Twitter
    rdt: any // Reddit
    pvd: any // Paved
    uetq: any // Microsoft Ads
  }
}
export type FractionLike = Fraction | Price<Currency, Currency> | CurrencyAmount<Currency>

export type ComposableCowInfo = {
  id?: string
  parentId?: string
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

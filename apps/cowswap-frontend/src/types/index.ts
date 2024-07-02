import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

export * from 'legacy/types'

export type Timestamp = number // Example: 1667981900 === Nov 09 2022 14:18:20

export type Milliseconds = number // Example: 30000 === 30 sec

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

// TODO: it'legacy from the old SDK version
export interface PriceInformation {
  token: string
  amount: string | null
  quoteValidTo?: number
  quoteId?: number
}

export interface FeeInformation {
  expirationDate: string
  amount: string
}

import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

export * from 'legacy/types'

export type Timestamp = number // Example: 1667981900 === Nov 09 2022 14:18:20

export type Milliseconds = number // Example: 30000 === 30 sec

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type Nullish<T> = T | null | undefined

// This is for Pixel tracking injected code
declare global {
  interface Window {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: any // Facebook (Meta)
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lintrk: any // Linkedin
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    twq: any // Twitter
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rdt: any // Reddit
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pvd: any // Paved
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

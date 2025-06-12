import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

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

export type ComposableCowInfo = {
  id?: string
  parentId?: string
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

export type Timestamp = number // Example: 1667981900 === Nov 09 2022 14:18:20

export type Milliseconds = number // Example: 30000 === 30 sec

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type Nullish<T> = T | null | undefined

export type FractionLike = Fraction | Price<Currency, Currency> | CurrencyAmount<Currency>

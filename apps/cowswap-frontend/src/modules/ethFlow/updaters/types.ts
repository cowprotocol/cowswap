import { Percent } from '@uniswap/sdk-core'

export type DeadlineSettings = StoredSettings<number>

export type Slippage = Percent | 'auto'

type StoredSettings<T> = {
  regular?: T
  ethFlow?: T
}

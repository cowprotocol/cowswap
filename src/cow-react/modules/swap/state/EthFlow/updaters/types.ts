import { Percent } from '@uniswap/sdk-core'

type StoredSettings<T> = {
  regular?: T
  ethFlow?: T
}

export type SerializedSlippage = 'auto' | [string, string]
export type Slippage = Percent | 'auto'

export type SerializedSlippageSettings = StoredSettings<SerializedSlippage>
export type SlippageSettings = StoredSettings<Slippage>

export type DeadlineSettings = StoredSettings<number>

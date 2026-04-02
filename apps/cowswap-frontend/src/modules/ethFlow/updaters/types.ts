import { Percent } from '@cowprotocol/currency'

export type DeadlineSettings = StoredSettings<number>

export type Slippage = Percent | 'auto'

type StoredSettings<T> = {
  regular?: T
  ethFlow?: T
}

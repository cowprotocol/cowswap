import { Percent } from '@cowprotocol/common-entities'

type StoredSettings<T> = {
  regular?: T
  ethFlow?: T
}

export type Slippage = Percent | 'auto'

export type DeadlineSettings = StoredSettings<number>

import { atomWithStorage } from 'jotai/utils'

import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

type Address = string
type Symbol = string
export type CorrelatedTokens = Record<Address, Symbol>

export const correlatedTokensAtom = atomWithStorage<PersistentStateByChain<CorrelatedTokens[]>>(
  'correlatedTokensAtom:v0',
  mapSupportedNetworks<CorrelatedTokens[]>([]),
)

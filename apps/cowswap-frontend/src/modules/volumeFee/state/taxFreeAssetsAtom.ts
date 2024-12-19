import { atomWithStorage } from 'jotai/utils'

import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

type TokenId = string

export const taxFreeAssetsAtom = atomWithStorage<PersistentStateByChain<TokenId[][]>>(
  'taxFreeAssetsAtom:v1',
  mapSupportedNetworks<TokenId[][]>([]),
)

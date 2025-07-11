import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import type { PersistentStateByChainAccount } from '@cowprotocol/types'

import { BridgeOrderQuoteData } from 'common/types/bridge'

export type BridgeOrdersState = PersistentStateByChainAccount<BridgeOrderQuoteData[]>

export const bridgeOrderQuoteAtom = atomWithStorage<BridgeOrdersState>(
  'bridgeOrdersAtom:v0',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

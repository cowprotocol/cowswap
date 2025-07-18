import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import type { PersistentStateByChainAccount } from '@cowprotocol/types'
import { BridgeOrderData } from '@cowprotocol/types'

export type BridgeOrdersState = PersistentStateByChainAccount<BridgeOrderData[]>

export const bridgeOrderQuoteAtom = atomWithStorage<BridgeOrdersState>(
  'bridgeOrdersAtom:v0',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

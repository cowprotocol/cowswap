import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import type { PersistentStateByChainAccount } from '@cowprotocol/types'

import { BridgeOrderData, BridgeQuoteAmounts } from 'common/types/bridge'

import {
  bridgeOrdersStateSerializer,
  deserializeQuoteAmounts,
  serializeQuoteAmounts,
} from './bridgeOrdersStateSerializer'
import { SerializedAmount } from './types'

type SerializedBridgeAmounts = BridgeQuoteAmounts<SerializedAmount>
type BridgeOrderDataSerialized = BridgeOrderData<SerializedBridgeAmounts>

type BridgeOrdersStateSerialized<T = BridgeOrderDataSerialized[]> = PersistentStateByChainAccount<T>
type BridgeOrdersState = BridgeOrdersStateSerialized<BridgeOrderData[]>

const _bridgeOrdersAtom = atomWithStorage<BridgeOrdersStateSerialized>(
  'bridgeOrdersAtom:v1',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

function deserializeState(state: BridgeOrdersStateSerialized): BridgeOrdersState {
  return bridgeOrdersStateSerializer(state, (order) => {
    return {
      ...order,
      quoteAmounts: deserializeQuoteAmounts(order.quoteAmounts),
    }
  })
}

/**
 * Since BridgeOrderData contains CurrencyAmount, we have to serialize/deserialize it
 * For that we use bridgeOrdersStateSerializer
 */
export const bridgeOrdersAtom = atom<
  BridgeOrdersState,
  [BridgeOrdersState | ((state: BridgeOrdersState) => BridgeOrdersState)],
  BridgeOrdersStateSerialized
>(
  (get) => {
    return deserializeState(get(_bridgeOrdersAtom))
  },
  (get, set, updater) => {
    const update = typeof updater === 'function' ? updater(deserializeState(get(_bridgeOrdersAtom))) : updater

    const newState = bridgeOrdersStateSerializer(update, (order) => {
      return {
        ...order,
        quoteAmounts: serializeQuoteAmounts(order.quoteAmounts),
      }
    })

    set(_bridgeOrdersAtom, newState)

    return newState
  },
)

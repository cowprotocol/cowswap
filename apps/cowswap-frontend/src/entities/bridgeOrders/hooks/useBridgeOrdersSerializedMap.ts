import { useAtomValue } from 'jotai'

import { BridgeOrdersStateSerialized, bridgeOrdersStoreAtom } from '../state/bridgeOrdersAtom'

export function useBridgeOrdersSerializedMap(): BridgeOrdersStateSerialized {
  return useAtomValue(bridgeOrdersStoreAtom)
}

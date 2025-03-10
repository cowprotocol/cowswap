import { useAtomValue } from 'jotai'

import { bridgeProviderAtom } from '../state/bridgeProviderAtom'

// TODO: use BridgeSDK instead
export function useBridgeProvider() {
  return useAtomValue(bridgeProviderAtom)
}

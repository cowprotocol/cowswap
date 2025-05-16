import { useAtomValue } from 'jotai'

import { bridgeProviderAtom } from '../state/bridgeProviderAtom'

export function useBridgeProvider() {
  return useAtomValue(bridgeProviderAtom)
}

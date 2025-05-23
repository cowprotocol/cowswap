import { useAtomValue } from 'jotai'

import { bridgeProviderAtom } from './bridgeProviderAtom'

export function useBridgeProvider() {
  return useAtomValue(bridgeProviderAtom)
}

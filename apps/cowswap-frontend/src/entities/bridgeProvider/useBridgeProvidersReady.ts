import { useAtomValue } from 'jotai'

import { bridgeProvidersReadyAtom } from './bridgeProvidersAtom'

export function useBridgeProvidersReady(): boolean {
  return useAtomValue(bridgeProvidersReadyAtom)
}

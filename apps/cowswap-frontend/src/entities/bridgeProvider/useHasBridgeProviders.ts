import { useAtomValue } from 'jotai'

import { hasBridgeProvidersAtom } from './bridgeProvidersAtom'

export function useHasBridgeProviders(): boolean {
  return useAtomValue(hasBridgeProvidersAtom)
}

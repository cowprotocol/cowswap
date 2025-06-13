import { useAtomValue } from 'jotai'

import { bridgeProviderAtom } from './bridgeProviderAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBridgeProvider() {
  return useAtomValue(bridgeProviderAtom)
}

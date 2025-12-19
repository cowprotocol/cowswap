import { useAtomValue } from 'jotai'

import { isHookBridgeProvider } from '@cowprotocol/sdk-bridging'

import { bridgeProvidersAtom } from './bridgeProvidersAtom'

export function useHasHookBridgeProvidersEnabled(): boolean {
  const bridgeProviders = useAtomValue(bridgeProvidersAtom)

  return [...bridgeProviders].some(isHookBridgeProvider)
}

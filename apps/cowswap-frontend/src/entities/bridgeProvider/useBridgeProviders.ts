import { useAtomValue } from 'jotai'

import { BridgeProvider, BridgeQuoteResult } from '@cowprotocol/sdk-bridging'

import { bridgeProvidersAtom } from './bridgeProvidersAtom'

export function useBridgeProviders(): BridgeProvider<BridgeQuoteResult>[] {
  return useAtomValue(bridgeProvidersAtom)
}

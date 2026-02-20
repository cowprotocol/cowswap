import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { deprecatedChainsAtom, isProviderNetworkDeprecatedAtom } from 'entities/common/isProviderNetworkDeprecated.atom'

export function useDeprecatedChains(): Set<SupportedChainId> {
  return useAtomValue(deprecatedChainsAtom)
}

export function useIsProviderNetworkDeprecated(): boolean {
  return useAtomValue(isProviderNetworkDeprecatedAtom)
}

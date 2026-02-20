import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { deprecatedChainsAtom } from 'entities/common/deprecatedChains.atom'

export function useDeprecatedChains(): Set<SupportedChainId> {
  return useAtomValue(deprecatedChainsAtom)
}

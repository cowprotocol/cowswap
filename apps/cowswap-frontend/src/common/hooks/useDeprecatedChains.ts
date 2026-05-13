import { useAtomValue } from 'jotai'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { deprecatedChainsAtom } from 'entities/common/deprecatedChains.atom'

export function useDeprecatedChains(): Set<TargetChainId> {
  return useAtomValue(deprecatedChainsAtom)
}

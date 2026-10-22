import { atom } from 'jotai'

import { getDeprecatedChains } from '@cowprotocol/common-utils'
import { SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

export const deprecatedChainsAtom = atom<Set<TargetChainId>>((get) => {
  const { isLineaDeprecated } = get(featureFlagsAtom)

  // The SDK marks Linea deprecated ahead of its shutdown, so the flag holds it back until then.
  // Flags still loading or blocked keep Linea tradeable instead of showing it as deactivated early.
  const chainsToSkip: TargetChainId[] = isLineaDeprecated ? [] : [SupportedChainId.LINEA]

  return new Set(getDeprecatedChains(chainsToSkip))
})

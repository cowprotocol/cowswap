import { atom } from 'jotai'

import { getDeprecatedChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

export const deprecatedChainsAtom = atom<Set<SupportedChainId>>((get) => {
  const { isLensDeprecated } = get(featureFlagsAtom)

  const chainsToSkip: SupportedChainId[] = []

  if (isLensDeprecated === false) {
    chainsToSkip.push(SupportedChainId.LENS)
  }

  // In order for a chain to be considered deprecated in the frontend, it needs to be marked as deprecated in the SDK,
  // and its corresponding feature flag needs to be true. If the feature flag is false or undefined, but the chain is
  // marked as deprecated in the SDK, it will be considered deprecated in the frontend anyway.
  return new Set(getDeprecatedChains(chainsToSkip))
})

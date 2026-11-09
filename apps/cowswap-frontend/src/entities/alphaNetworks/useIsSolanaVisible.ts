import { useAtomValue } from 'jotai'

import { useFeatureFlags, useIsSolanaBetaOrHigher } from '@cowprotocol/common-hooks'

import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'

export function useIsSolanaVisible(): boolean {
  const { isAlphaNetworksOptionVisible } = useFeatureFlags()
  const isBetaOrHigher = useIsSolanaBetaOrHigher()
  const areAlphaNetworksEnabled = useAtomValue(alphaNetworksEnabledAtom)

  return isBetaOrHigher || (!!isAlphaNetworksOptionVisible && areAlphaNetworksEnabled)
}

import { useAtomValue } from 'jotai'

import { useFeatureFlags, useIsSolanaBeta } from '@cowprotocol/common-hooks'

import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'

export function useIsSolanaVisible(): boolean {
  const { isSolanaEnabled, isAlphaNetworksOptionVisible } = useFeatureFlags()
  const isSolanaBeta = useIsSolanaBeta()
  const areAlphaNetworksEnabled = useAtomValue(alphaNetworksEnabledAtom)

  return !!isSolanaEnabled || isSolanaBeta || (!!isAlphaNetworksOptionVisible && areAlphaNetworksEnabled)
}

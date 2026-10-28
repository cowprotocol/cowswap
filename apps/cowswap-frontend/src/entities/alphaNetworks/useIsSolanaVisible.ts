import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'

export function useIsSolanaVisible(): boolean {
  const { isSolanaEnabled, isAlphaNetworksOptionVisible } = useFeatureFlags()
  const areAlphaNetworksEnabled = useAtomValue(alphaNetworksEnabledAtom)

  return !!isSolanaEnabled || (!!isAlphaNetworksOptionVisible && areAlphaNetworksEnabled)
}

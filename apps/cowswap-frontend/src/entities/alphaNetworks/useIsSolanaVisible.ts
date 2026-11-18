import { useAtomValue } from 'jotai'

import { useFeatureFlags, useIsSolanaPublicLaunched } from '@cowprotocol/common-hooks'

import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'

export function useIsSolanaVisible(): boolean {
  const { isSolanaEnabled, isAlphaNetworksOptionVisible } = useFeatureFlags()
  const isSolanaPublicLaunched = useIsSolanaPublicLaunched()
  const areAlphaNetworksEnabled = useAtomValue(alphaNetworksEnabledAtom)

  return !!isSolanaEnabled || isSolanaPublicLaunched || (!!isAlphaNetworksOptionVisible && areAlphaNetworksEnabled)
}

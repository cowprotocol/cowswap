import { useAtomValue } from 'jotai'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { featureFlagsStatusAtom } from 'common/state/featureFlagsState'

export function useIsUrlChainUnavailable(chainId: number | null | undefined): boolean {
  const availableChains = useAvailableChains()
  const featureFlagsStatus = useAtomValue(featureFlagsStatusAtom)
  // Flag-gated chains (Solana) are unknown in the app until LaunchDarkly resolves, the widget forces them off
  const canValidate = isInjectedWidget() || featureFlagsStatus !== 'loading'

  if (!chainId || !canValidate) return false

  return !availableChains.includes(chainId as SupportedChainId)
}

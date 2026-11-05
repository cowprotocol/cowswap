import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

/**
 * Whether Wait & Save may be offered: feature flag on, not Solana, not a deprecated network, and not hidden by the widget host.
 */
export function useIsWaitAndSaveAvailable(): boolean {
  const { chainId } = useWalletInfo()
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const { hideWaitAndSave } = useInjectedWidgetParams()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()

  return Boolean(isWaitForCowsEnabled && !hideWaitAndSave && !isSolanaChain(chainId) && !isProviderNetworkDeprecated)
}

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'

/**
 * Whether Wait & Save may be offered: feature flag on, not Solana, not a deprecated network,
 * not a bridge trade, and not hidden by the widget host.
 *
 * Bridge orders are excluded because the batch wait is uncertain and bridge providers
 * require timely fund delivery.
 */
export function useIsWaitAndSaveAvailable(): boolean {
  const { chainId } = useWalletInfo()
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const { hideWaitAndSave } = useInjectedWidgetParams()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isBridging = useIsCurrentTradeBridging()

  return Boolean(
    isWaitForCowsEnabled && !hideWaitAndSave && !isSolanaChain(chainId) && !isProviderNetworkDeprecated && !isBridging,
  )
}

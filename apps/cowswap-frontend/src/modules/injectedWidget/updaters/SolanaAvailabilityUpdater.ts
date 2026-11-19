import { useEffect } from 'react'

import { useSetIsSolanaEnabledInWidget } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { IS_SOLANA_WALLET_ENABLED } from '@cowprotocol/wallet'
import { isSolanaEnabledForWidget } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function SolanaAvailabilityUpdater(): null {
  const params = useInjectedWidgetParams()
  const setIsSolanaEnabledInWidget = useSetIsSolanaEnabledInWidget()

  // `updateParams` never rebuilds the iframe src, so a partner can switch `enableSolana` on long
  // after the Reown adapters were built from the URL. The wallet config is the ceiling here, or the
  // network list would offer a chain that no connector in this session can sign on.
  const isSolanaEnabled = IS_SOLANA_WALLET_ENABLED && isSolanaEnabledForWidget(params)

  useEffect(() => {
    if (!isInjectedWidget()) return

    setIsSolanaEnabledInWidget(isSolanaEnabled)
  }, [isSolanaEnabled, setIsSolanaEnabledInWidget])

  return null
}

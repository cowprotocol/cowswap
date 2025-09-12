import { useEffect } from 'react'

import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from '../constants/routes'

export function BridgingEnabledUpdater(): null {
  const { isBridgingEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isSmartContractWallet = useIsSmartContractWallet()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()

  const isSwapRoute = tradeTypeInfo?.route === Routes.SWAP

  function shouldEnableBridging(
    featureFlagEnabled: boolean,
    scWallet: boolean | undefined,
    swapRoute: boolean,
  ): boolean {
    // Only enable bridging once we definitively know it's an EOA (strict false)
    return featureFlagEnabled && scWallet === false && swapRoute
  }

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging(isBridgingEnabled, isSmartContractWallet, isSwapRoute))
  }, [setIsBridgingEnabled, isBridgingEnabled, isSmartContractWallet, isSwapRoute])

  return null
}

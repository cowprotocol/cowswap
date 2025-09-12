import { useEffect } from 'react'

import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { AccountType } from '@cowprotocol/types'
import { useAccountType } from '@cowprotocol/wallet'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from '../constants/routes'

export function BridgingEnabledUpdater(): null {
  const { isBridgingEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const accountType = useAccountType()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()

  const isSwapRoute = tradeTypeInfo?.route === Routes.SWAP

  function shouldEnableBridging(
    featureFlagEnabled: boolean,
    accountType: AccountType | undefined,
    swapRoute: boolean,
  ): boolean {
    // Only enable bridging once we definitively know it's an EOA
    return featureFlagEnabled && accountType === AccountType.EOA && swapRoute
  }

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging(isBridgingEnabled, accountType, isSwapRoute))
  }, [setIsBridgingEnabled, isBridgingEnabled, accountType, isSwapRoute])

  return null
}

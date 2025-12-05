import { useEffect } from 'react'

import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { AccountType } from '@cowprotocol/types'
import { useAccountType, useWalletInfo } from '@cowprotocol/wallet'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from '../constants/routes'

export function BridgingEnabledUpdater(): null {
  const { account } = useWalletInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const accountType = useAccountType()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()
  const { isBridgingEnabled: isBridgingEnabledFlag } = useFeatureFlags()

  const isSwapRoute = tradeTypeInfo?.route === Routes.SWAP
  // Feature flag off should disable bridging regardless of route/wallet compatibility.
  const isFeatureFlagEnabled = isBridgingEnabledFlag === undefined ? true : Boolean(isBridgingEnabledFlag)
  const isWalletCompatible = Boolean(account ? accountType !== AccountType.SMART_CONTRACT : true)
  const shouldEnableBridging = isWalletCompatible && isSwapRoute && isFeatureFlagEnabled

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}

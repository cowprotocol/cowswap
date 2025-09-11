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

  useEffect(() => {
    // Only enable bridging once we definitively know it's an EOA (strict false)
    setIsBridgingEnabled(isBridgingEnabled && isSmartContractWallet === false && isSwapRoute)
  }, [setIsBridgingEnabled, isBridgingEnabled, isSmartContractWallet, isSwapRoute])

  return null
}

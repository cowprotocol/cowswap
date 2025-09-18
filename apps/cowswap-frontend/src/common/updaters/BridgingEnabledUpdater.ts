import { useEffect } from 'react'

import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from '../constants/routes'

export function BridgingEnabledUpdater(): null {
  const { account } = useWalletInfo()
  const { isBridgingEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isSmartContractWallet = useIsSmartContractWallet()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()

  const isSwapRoute = tradeTypeInfo?.route === Routes.SWAP

  const isWalletCompatible = Boolean(account ? isSmartContractWallet === false : true)
  const shouldEnableBridging = isBridgingEnabled && isWalletCompatible && isSwapRoute

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}

import { useEffect } from 'react'

import { useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { AccountType } from '@cowprotocol/types'
import { useAccountType, useWalletInfo } from '@cowprotocol/wallet'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from '../constants/routes'

export function BridgingEnabledUpdater(): null {
  const { account } = useWalletInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const accountType = useAccountType()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()

  const isSwapRoute = tradeTypeInfo?.route === Routes.SWAP

  const isWalletCompatible = Boolean(account ? accountType !== AccountType.SMART_CONTRACT : true)
  const shouldEnableBridging = isWalletCompatible && isSwapRoute

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}

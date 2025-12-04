import { useEffect } from 'react'

import { useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from '../constants/routes'

export function BridgingEnabledUpdater(): null {
  const tradeTypeInfo = useTradeTypeInfo()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()

  const shouldEnableBridging = tradeTypeInfo?.route === Routes.SWAP

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}

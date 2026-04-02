import { useEffect } from 'react'

import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics, PixelEvent } from '../pixels/PixelAnalytics'

const NOT_CONNECTED_WALLET_NAME = 'Not connected'

interface UserContextEffectParams {
  account: string | undefined
  walletName: string | undefined
  prevAccount: string | null | undefined
  pixelAnalytics?: PixelAnalytics
  cowAnalytics: CowAnalytics
}

export function useUserContext({
  account,
  walletName,
  prevAccount,
  pixelAnalytics,
  cowAnalytics,
}: UserContextEffectParams): void {
  useEffect(() => {
    const walletNameForContext = account ? walletName : NOT_CONNECTED_WALLET_NAME

    cowAnalytics.setUserAccount(account, walletNameForContext)
    cowAnalytics.setContext(AnalyticsContext.walletName, walletNameForContext)

    if (!prevAccount && account && pixelAnalytics) {
      pixelAnalytics.sendAllPixels(PixelEvent.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount, pixelAnalytics, cowAnalytics])
}

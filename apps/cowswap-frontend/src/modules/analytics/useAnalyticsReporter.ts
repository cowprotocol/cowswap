import { useEffect } from 'react'

import { AnalyticsContext, PixelEvent } from '@cowprotocol/analytics'
import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router-dom'

import { useInjectedWidgetMetaData } from 'modules/injectedWidget'

import { useGetMarketDimension } from '../../common/hooks/useGetMarketDimension'
import { cowAnalytics, pixelAnalytics } from 'modules/analytics'

let initiatedPixel = false

export function useAnalyticsReporter() {
  const { pathname, search } = useLocation()

  const { chainId, account } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const injectedWidgetMetaData = useInjectedWidgetMetaData()
  const prevAccount = usePrevious(account)

  const marketDimension = useGetMarketDimension()

  useEffect(() => {
    // Set analytics context: chainId
    cowAnalytics.setContext(AnalyticsContext.chainId, chainId.toString())
  }, [chainId])

  // Handle wallet name custom dimension
  const injectedWidgetAppId = injectedWidgetMetaData?.appCode

  useEffect(() => {
    // Set analytics context: user account and wallet name
    cowAnalytics.setUserAccount(AnalyticsContext.userAddress)
    cowAnalytics.setContext(AnalyticsContext.walletName, account ? walletName : 'Not connected')

    // Handle pixel tracking on wallet connection
    if (!prevAccount && account && pixelAnalytics) {
      pixelAnalytics.sendAllPixels(PixelEvent.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount])

  useEffect(() => {
    // Set analytics context: market
    cowAnalytics.setContext(AnalyticsContext.market, marketDimension || undefined)
  }, [marketDimension])

  useEffect(() => {
    // Set analytics context: injected widget app id
    cowAnalytics.setContext(AnalyticsContext.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId])

  useEffect(() => {
    cowAnalytics.sendPageView(`${pathname}${search}`)
  }, [pathname, search])

  // Handle initiate pixel tracking
  useEffect(() => {
    if (!initiatedPixel) {
      if (pixelAnalytics) {
        // Sent all pixels
        pixelAnalytics.sendAllPixels(PixelEvent.INIT)
      }

      initiatedPixel = true
    }
  }, [])
}

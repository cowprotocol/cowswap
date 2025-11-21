import { useEffect, type MutableRefObject } from 'react'

import { getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getDefaultTradeRawState, type TradeRawState } from 'modules/trade/types/TradeRawState'

import { SetupTradeStateContext } from './useSetupTradeStateContext'

const INITIAL_CHAIN_ID_FROM_URL = getRawCurrentChainIdFromUrl()

function shouldHandleProviderChainChange(params: {
  isWindowVisible: boolean
  prevIsWindowVisible: boolean | null | undefined
  providerChainId: number | null | undefined
  urlChainId: number | null | undefined
  prevProviderChainId: number | null | undefined
}): boolean {
  const { isWindowVisible, prevIsWindowVisible, providerChainId, urlChainId, prevProviderChainId } = params

  if (!isWindowVisible) {
    return false
  }

  const providerChangedNetworkWhenWindowInactive =
    isWindowVisible && prevIsWindowVisible !== isWindowVisible && providerChainId !== urlChainId

  const noNetworkChanges = !providerChainId || providerChainId === urlChainId || providerChainId === prevProviderChainId

  if (!providerChangedNetworkWhenWindowInactive && noNetworkChanges) {
    return false
  }

  return true
}

function handleProviderChainChange(params: {
  rememberedUrlStateRef: MutableRefObject<TradeRawState | null>
  navigateAndSwitchNetwork: (chainId: number | null, tradeState: TradeRawState) => Promise<void>
  isFirstLoad: boolean
  isWalletConnected: boolean
  setIsFirstLoad: (isFirstLoad: boolean) => void
  urlChainId: number | null | undefined
  providerChainId: number | null | undefined
  switchNetworkInWallet: (targetChainId: SupportedChainId) => Promise<void>
}): void {
  const {
    rememberedUrlStateRef,
    navigateAndSwitchNetwork,
    isFirstLoad,
    isWalletConnected,
    setIsFirstLoad,
    urlChainId,
    providerChainId,
    switchNetworkInWallet,
  } = params

  const rememberedUrlState = rememberedUrlStateRef.current

  if (rememberedUrlState) {
    rememberedUrlStateRef.current = null
    navigateAndSwitchNetwork(rememberedUrlState.chainId, rememberedUrlState)
    return
  }

  if (isFirstLoad && isWalletConnected) {
    setIsFirstLoad(false)

    if (urlChainId && INITIAL_CHAIN_ID_FROM_URL !== null) {
      switchNetworkInWallet(urlChainId)
    }
  }

  navigateAndSwitchNetwork(providerChainId || null, getDefaultTradeRawState(providerChainId || null))
}

export function useHandleProviderChainChangeEffect(context: SetupTradeStateContext): void {
  const {
    isTokenSelectOpen,
    isWindowVisible,
    prevIsWindowVisible,
    providerChainId,
    urlChainId,
    prevProviderChainId,
    navigateAndSwitchNetwork,
    isFirstLoad,
    isWalletConnected,
    switchNetworkInWallet,
    rememberedUrlStateRef,
    setIsFirstLoad,
  } = context

  useEffect(() => {
    const shouldHandle = shouldHandleProviderChainChange({
      isWindowVisible,
      prevIsWindowVisible,
      providerChainId,
      urlChainId,
      prevProviderChainId,
    })

    if (!shouldHandle) {
      return
    }

    handleProviderChainChange({
      rememberedUrlStateRef,
      navigateAndSwitchNetwork,
      isFirstLoad,
      isWalletConnected,
      setIsFirstLoad,
      urlChainId,
      providerChainId,
      switchNetworkInWallet,
    })

    console.debug('[TRADE STATE]', 'Provider changed chainId', {
      providerChainId,
      urlChanges: rememberedUrlStateRef.current,
    })
  }, [
    isTokenSelectOpen,
    isWindowVisible,
    prevIsWindowVisible,
    providerChainId,
    urlChainId,
    prevProviderChainId,
    navigateAndSwitchNetwork,
    isFirstLoad,
    isWalletConnected,
    switchNetworkInWallet,
    rememberedUrlStateRef,
    setIsFirstLoad,
  ])
}

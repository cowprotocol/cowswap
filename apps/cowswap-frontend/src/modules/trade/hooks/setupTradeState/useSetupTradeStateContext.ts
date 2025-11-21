import { useCallback, useRef, useState, type MutableRefObject } from 'react'

import { useIsWindowVisible, usePrevious } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useSelectTokenWidgetState } from 'modules/tokensList'
import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useTradeTypeInfoFromUrl } from 'modules/trade/hooks/useTradeTypeInfoFromUrl'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'
import { type ExtendedTradeRawState, type TradeRawState } from 'modules/trade/types/TradeRawState'
import { TradeType } from 'modules/trade/types/TradeType'

import { useSetupTradeStateFromUrl } from './useSetupTradeStateFromUrl'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'

import { useTradeState } from '../useTradeState'

export interface SetupTradeStateContext {
  tradeStateFromUrl: TradeRawState | null
  prevTradeStateFromUrl: TradeRawState | null | undefined
  currentChainId: number
  isTokenSelectOpen: boolean
  isAlternativeModalVisible: boolean
  isLimitOrderTrade: boolean
  isWalletConnected: boolean
  prevProviderChainId: number | null | undefined
  providerChainId: number | null | undefined
  state?: ExtendedTradeRawState
  updateState?: (update: Partial<ExtendedTradeRawState>) => void
  navigateAndSwitchNetwork: (chainId: number | null, tradeState: TradeRawState) => Promise<void>
  rememberedUrlStateRef: MutableRefObject<TradeRawState | null>
  urlChainId: number | null | undefined
  provider: unknown
  isWindowVisible: boolean
  prevIsWindowVisible: boolean | null | undefined
  isFirstLoad: boolean
  setIsFirstLoad: (isFirstLoad: boolean) => void
  switchNetworkInWallet: (targetChainId: SupportedChainId) => Promise<void>
}

export function useSetupTradeStateContext(): SetupTradeStateContext {
  useSetupTradeStateFromUrl()
  const { chainId: providerChainId, account } = useWalletInfo()
  const prevProviderChainId = usePrevious(providerChainId)

  const isWindowVisible = useIsWindowVisible()
  const prevIsWindowVisible = usePrevious(isWindowVisible)
  const provider = useWalletProvider()
  const tradeNavigate = useTradeNavigate()
  const switchNetwork = useSwitchNetwork()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const { state, updateState } = useTradeState()
  const tradeTypeInfo = useTradeTypeInfoFromUrl()
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()

  // When wallet is connected, and user navigates to the URL with a new chainId
  // We must change chainId in provider, and only then change the trade state
  // Since the network chaning process takes some time, we have to remember the state from URL
  const rememberedUrlStateRef = useRef<TradeRawState | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const isWalletConnected = !!account
  const urlChainId = tradeStateFromUrl?.chainId
  const prevTradeStateFromUrl = usePrevious(tradeStateFromUrl)

  const currentChainId = !urlChainId ? prevProviderChainId || providerChainId || SupportedChainId.MAINNET : urlChainId

  const isAlternativeModalVisible = useIsAlternativeOrderModalVisible()
  const isLimitOrderTrade = tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER

  const switchNetworkInWallet = useCallback(
    async (targetChainId: SupportedChainId) => {
      try {
        await switchNetwork(targetChainId)
      } catch (error) {
        // We are ignoring Gnosis safe context error
        // Because it's a normal situation when we are not in Gnosis safe App
        if (error.name === 'NoSafeContext') return

        console.error('Network switching error: ', error)
      }

      // Clean up rememberedUrlStateRef when network switching is finished
      rememberedUrlStateRef.current = null
    },
    [switchNetwork],
  )

  const navigateAndSwitchNetwork = useCallback(
    async (chainId: number | null, tradeState: TradeRawState): Promise<void> => {
      await tradeNavigate(chainId, tradeState)
      await switchNetworkInWallet(chainId || SupportedChainId.MAINNET)
    },
    [tradeNavigate, switchNetworkInWallet],
  )

  return {
    tradeStateFromUrl,
    prevTradeStateFromUrl,
    currentChainId,
    isTokenSelectOpen,
    isAlternativeModalVisible,
    isLimitOrderTrade,
    isWalletConnected,
    prevProviderChainId,
    providerChainId,
    state,
    updateState,
    navigateAndSwitchNetwork,
    rememberedUrlStateRef,
    urlChainId,
    provider,
    isWindowVisible,
    prevIsWindowVisible,
    isFirstLoad,
    setIsFirstLoad,
    switchNetworkInWallet,
  }
}

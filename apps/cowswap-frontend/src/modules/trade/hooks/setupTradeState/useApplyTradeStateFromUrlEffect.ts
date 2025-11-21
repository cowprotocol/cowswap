import { useEffect } from 'react'

import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

import {
  areTokensEmpty,
  hasSameTokens,
  isOnlyChainIdChanged,
  shouldIgnoreUrlTradeStateEffect,
  handleProviderAndUrlChainIdMismatch,
  handleInvalidTokensOrChainChange,
  isSameTradeUrlState,
} from './tradeStateUrlSync'
import { SetupTradeStateContext } from './useSetupTradeStateContext'

export function useApplyTradeStateFromUrlEffect(context: SetupTradeStateContext): void {
  const {
    tradeStateFromUrl,
    prevTradeStateFromUrl,
    currentChainId,
    isTokenSelectOpen,
    isAlternativeModalVisible,
    isLimitOrderTrade,
    isWalletConnected,
    prevProviderChainId,
    state,
    navigateAndSwitchNetwork,
    updateState,
    rememberedUrlStateRef,
  } = context

  useEffect(() => {
    if (!tradeStateFromUrl) {
      return
    }

    const onlyChainIdIsChanged = isOnlyChainIdChanged(prevTradeStateFromUrl, tradeStateFromUrl, currentChainId)
    const tokensAreEmpty = areTokensEmpty(tradeStateFromUrl)
    const sameTokens = hasSameTokens(tradeStateFromUrl)
    const hasRememberedUrlState = Boolean(rememberedUrlStateRef.current)

    const shouldIgnore = shouldIgnoreUrlTradeStateEffect({
      isTokenSelectOpen,
      isAlternativeModalVisible,
      isLimitOrderTrade,
      hasRememberedUrlState,
      onlyChainIdIsChanged,
    })

    if (shouldIgnore) {
      return
    }

    const providerAndUrlChainIdMismatch = currentChainId !== prevProviderChainId

    const defaultState = getDefaultTradeRawState(currentChainId)

    const handledProviderMismatch = handleProviderAndUrlChainIdMismatch({
      isWalletConnected,
      providerAndUrlChainIdMismatch,
      previousTradeStateFromUrl: prevTradeStateFromUrl,
      tradeStateFromUrl,
      state,
      updateState,
      rememberedUrlStateRef,
    })

    if (handledProviderMismatch) {
      return
    }

    const handledInvalidTokensOrChainChange = handleInvalidTokensOrChainChange({
      sameTokens,
      tokensAreEmpty,
      onlyChainIdIsChanged,
      currentChainId,
      defaultState,
      state,
      navigateAndSwitchNetwork,
      updateState,
    })

    if (handledInvalidTokensOrChainChange) {
      return
    }

    if (!isSameTradeUrlState(tradeStateFromUrl, state)) {
      updateState?.(tradeStateFromUrl)
    }
    console.debug('[TRADE STATE]', 'Applying a new state from URL', tradeStateFromUrl)
  }, [
    tradeStateFromUrl,
    prevTradeStateFromUrl,
    currentChainId,
    isTokenSelectOpen,
    isAlternativeModalVisible,
    isLimitOrderTrade,
    isWalletConnected,
    prevProviderChainId,
    state,
    navigateAndSwitchNetwork,
    updateState,
    rememberedUrlStateRef,
  ])
}

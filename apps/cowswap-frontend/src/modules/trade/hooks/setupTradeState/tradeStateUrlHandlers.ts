import { type MutableRefObject } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getDefaultTradeRawState, type TradeRawState } from 'modules/trade/types/TradeRawState'

import {
  getUrlIssueReason,
  isSameTradeUrlState,
  type UrlIssueReason,
} from './tradeStateUrlPredicates'

export function handleProviderAndUrlChainIdMismatch(params: {
  isWalletConnected: boolean
  providerAndUrlChainIdMismatch: boolean
  previousTradeStateFromUrl: TradeRawState | null | undefined
  tradeStateFromUrl: TradeRawState
  state: TradeRawState | null | undefined
  updateState: ((state: TradeRawState) => void) | null | undefined
  rememberedUrlStateRef: MutableRefObject<TradeRawState | null>
}): boolean {
  const {
    isWalletConnected,
    providerAndUrlChainIdMismatch,
    previousTradeStateFromUrl,
    tradeStateFromUrl,
    state,
    updateState,
    rememberedUrlStateRef,
  } = params

  if (!isWalletConnected || !providerAndUrlChainIdMismatch || !previousTradeStateFromUrl) {
    return false
  }

  rememberedUrlStateRef.current = tradeStateFromUrl

  if (!isSameTradeUrlState(tradeStateFromUrl, state)) {
    updateState?.(tradeStateFromUrl)
  }

  console.debug(
    '[TRADE STATE]',
    'Remembering a new state from URL while changing chainId in provider',
    tradeStateFromUrl,
  )

  return true
}

export function shouldSyncUrlChainToProvider(params: {
  providerChainId: number | null | undefined
  urlChainId: number | null | undefined
  prevTradeStateFromUrl: TradeRawState | null | undefined
  currentChainId: number
}): boolean {
  const { providerChainId, urlChainId, prevTradeStateFromUrl, currentChainId } = params

  if (!providerChainId) {
    return false
  }

  if (providerChainId === currentChainId) {
    return false
  }

  if (!urlChainId || urlChainId === prevTradeStateFromUrl?.chainId) {
    return false
  }

  return true
}

export function handleUrlAndProviderChainSync(params: {
  isTokenSelectOpen: boolean
  providerChainId: number | null | undefined
  urlChainId: number | null | undefined
  prevTradeStateFromUrl: TradeRawState | null | undefined
  currentChainId: number
  rememberedUrlStateRef: MutableRefObject<TradeRawState | null>
  switchNetworkInWallet: (targetChainId: SupportedChainId) => Promise<void>
  provider: unknown
  setIsFirstLoad: (isFirstLoad: boolean) => void
}): void {
  const {
    isTokenSelectOpen,
    providerChainId,
    urlChainId,
    prevTradeStateFromUrl,
    currentChainId,
    rememberedUrlStateRef,
    switchNetworkInWallet,
    provider,
    setIsFirstLoad,
  } = params

  if (isTokenSelectOpen) {
    return
  }

  if (providerChainId === urlChainId) {
    setIsFirstLoad(false)
  }

  const shouldSync = shouldSyncUrlChainToProvider({
    providerChainId,
    urlChainId,
    prevTradeStateFromUrl,
    currentChainId,
  })

  if (!shouldSync) {
    return
  }

  const targetChainId = urlChainId ?? rememberedUrlStateRef.current?.chainId ?? currentChainId
  switchNetworkInWallet(targetChainId as SupportedChainId)

  console.debug('[TRADE STATE]', 'Set chainId to provider', { provider, urlChainId })
}

function applyUrlIssue(params: {
  reason: UrlIssueReason
  currentChainId: number
  defaultState: TradeRawState
  state: TradeRawState | null | undefined
  navigateAndSwitchNetwork: (chainId: number | null, tradeState: TradeRawState) => Promise<void>
  updateState: ((state: TradeRawState) => void) | null | undefined
}): void {
  const { reason, currentChainId, defaultState, state, navigateAndSwitchNetwork, updateState } = params

  navigateAndSwitchNetwork(currentChainId, defaultState)

  if (reason === 'sameTokens') {
    console.debug('[TRADE STATE]', 'Url contains invalid tokens, resetting')
    return
  }

  if (reason === 'tokensEmpty') {
    console.debug('[TRADE STATE]', 'Url does not contain both tokens, resetting')
    return
  }

  if (reason === 'onlyChainChanged' && state) {
    updateState?.({ ...state, chainId: currentChainId })
    console.debug('[TRADE STATE]', 'Only chainId was changed in URL, resetting')
  }
}

export function handleInvalidTokensOrChainChange(params: {
  sameTokens: boolean
  tokensAreEmpty: boolean
  onlyChainIdIsChanged: boolean
  currentChainId: number
  defaultState?: TradeRawState
  state: TradeRawState | null | undefined
  navigateAndSwitchNetwork: (chainId: number | null, tradeState: TradeRawState) => Promise<void>
  updateState: ((state: TradeRawState) => void) | null | undefined
}): boolean {
  const {
    sameTokens,
    tokensAreEmpty,
    onlyChainIdIsChanged,
    currentChainId,
    defaultState = getDefaultTradeRawState(currentChainId),
    state,
    navigateAndSwitchNetwork,
    updateState,
  } = params

  const reason = getUrlIssueReason({ sameTokens, tokensAreEmpty, onlyChainIdIsChanged })

  if (reason === 'none') {
    return false
  }

  if (reason === 'onlyChainChanged' && state && state.chainId === currentChainId) {
    return true
  }

  applyUrlIssue({ reason, currentChainId, defaultState, state, navigateAndSwitchNetwork, updateState })

  return true
}


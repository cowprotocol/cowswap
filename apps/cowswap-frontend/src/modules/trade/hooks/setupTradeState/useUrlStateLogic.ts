import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TradeRawState } from 'modules/trade/types/TradeRawState'
import { TradeType } from 'modules/trade/types/TradeType'

import { getChainAnalysis, getTokensAnalysis, isYieldRouteCheck } from './urlStateHelpers'

interface UrlStateAnalysisProps {
  tradeStateFromUrl: TradeRawState
  prevTradeStateFromUrl: TradeRawState | undefined
  currentChainId: SupportedChainId
  prevProviderChainId: SupportedChainId | undefined
  tradeTypeInfo: { tradeType: TradeType } | null
}

export interface UrlStateAnalysis {
  inputCurrencyId: string | null | undefined
  outputCurrencyId: string | null | undefined
  providerAndUrlChainIdMismatch: boolean
  onlyChainIdIsChanged: boolean
  tokensAreEmpty: boolean
  isYieldRoute: boolean
  sameTokens: boolean
}

export function analyzeUrlState({
  tradeStateFromUrl,
  prevTradeStateFromUrl,
  currentChainId,
  prevProviderChainId,
  tradeTypeInfo,
}: UrlStateAnalysisProps): UrlStateAnalysis {
  const { inputCurrencyId, outputCurrencyId } = tradeStateFromUrl
  
  const { onlyChainIdIsChanged, providerAndUrlChainIdMismatch } = getChainAnalysis(
    prevTradeStateFromUrl,
    inputCurrencyId,
    outputCurrencyId,
    currentChainId,
    prevProviderChainId,
  )

  const { tokensAreEmpty, sameTokens } = getTokensAnalysis(inputCurrencyId, outputCurrencyId)
  const isYieldRoute = isYieldRouteCheck(tradeTypeInfo)

  return {
    inputCurrencyId,
    outputCurrencyId,
    providerAndUrlChainIdMismatch,
    onlyChainIdIsChanged,
    tokensAreEmpty,
    isYieldRoute,
    sameTokens,
  }
}

interface ShouldResetStateProps {
  sameTokens: boolean
  tokensAreEmpty: boolean
  isYieldRoute: boolean
  onlyChainIdIsChanged: boolean
}

export function shouldResetState({ sameTokens, tokensAreEmpty, isYieldRoute, onlyChainIdIsChanged }: ShouldResetStateProps): boolean {
  return sameTokens || (tokensAreEmpty && !isYieldRoute) || onlyChainIdIsChanged
}


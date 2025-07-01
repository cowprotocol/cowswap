import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TradeRawState } from 'modules/trade/types/TradeRawState'
import { TradeType } from 'modules/trade/types/TradeType'

const EMPTY_TOKEN_ID = '_'

export function getTokensAnalysis(
  inputCurrencyId: string | null | undefined,
  outputCurrencyId: string | null | undefined,
): { tokensAreEmpty: boolean; sameTokens: boolean } {
  const tokensAreEmpty = !inputCurrencyId && !outputCurrencyId
  const sameTokens = Boolean(
    inputCurrencyId !== EMPTY_TOKEN_ID &&
    (inputCurrencyId || outputCurrencyId) &&
    inputCurrencyId?.toLowerCase() === outputCurrencyId?.toLowerCase()
  )

  return { tokensAreEmpty, sameTokens }
}

export function getChainAnalysis(
  prevTradeStateFromUrl: TradeRawState | undefined,
  inputCurrencyId: string | null | undefined,
  outputCurrencyId: string | null | undefined,
  currentChainId: SupportedChainId,
  prevProviderChainId: SupportedChainId | undefined,
): { onlyChainIdIsChanged: boolean; providerAndUrlChainIdMismatch: boolean } {
  const onlyChainIdIsChanged = Boolean(
    prevTradeStateFromUrl?.inputCurrencyId === inputCurrencyId &&
    prevTradeStateFromUrl?.outputCurrencyId === outputCurrencyId &&
    prevTradeStateFromUrl?.chainId !== currentChainId
  )

  const providerAndUrlChainIdMismatch = currentChainId !== prevProviderChainId

  return { onlyChainIdIsChanged, providerAndUrlChainIdMismatch }
}

export function isYieldRouteCheck(tradeTypeInfo: { tradeType: TradeType } | null): boolean {
  return tradeTypeInfo?.tradeType === TradeType.YIELD
}